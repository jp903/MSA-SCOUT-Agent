import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"
import { v4 as uuidv4 } from "uuid"

import { ensureDatabaseInitialized } from "./db"
import { User } from "./user-types"

const sql = neon(process.env.DATABASE_URL!)



export interface CreateUserData {
  email: string
  password?: string
  first_name: string
  last_name: string
  phone?: string | null
  company?: string | null
  google_id?: string | null
  avatar_url?: string | null
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Ensure database is initialized
      await ensureDatabaseInitialized();

      const {
        email,
        password,
        first_name,
        last_name,
        phone = null,
        company = null,
        google_id = null,
        avatar_url = null,
      } = userData

      console.log("Creating user with data:", {
        email,
        first_name,
        last_name,
        phone,
        company,
        google_id,
        avatar_url,
        hasPassword: !!password,
      })

      // Check if user already exists
      const existingUser = await sql`
        SELECT id, email FROM users WHERE email = ${email}
      `

      if (existingUser.length > 0) {
        throw new Error("User with this email already exists")
      }

      // Hash password if provided (not needed for Google users)
      let password_hash = null
      if (password) {
        password_hash = await bcrypt.hash(password, 12)
      }

      const userId = uuidv4()

      // Insert new user
      const result = await sql`
        INSERT INTO users (
          id, 
          email, 
          password_hash, 
          first_name, 
          last_name, 
          phone, 
          company, 
          google_id, 
          avatar_url,
          created_at, 
          updated_at
        )
        VALUES (
          ${userId},
          ${email},
          ${password_hash},
          ${first_name},
          ${last_name},
          ${phone},
          ${company},
          ${google_id},
          ${avatar_url},
          NOW(),
          NOW()
        )
        RETURNING *
      `

      if (result.length === 0) {
        throw new Error("Failed to create user")
      }

      console.log("User created successfully:", result[0])
      return result[0] as User
    } catch (error: any) {
      console.error("Error creating user:", error)
      throw new Error(error.message || "Failed to create user")
    }
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      // Ensure database is initialized
      await ensureDatabaseInitialized();

      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `

      return result.length > 0 ? (result[0] as User) : null
    } catch (error) {
      console.error("Error finding user by email:", error)
      return null
    }
  }

  static async findUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      // Ensure database is initialized
      await ensureDatabaseInitialized();

      const result = await sql`
        SELECT * FROM users WHERE google_id = ${googleId}
      `

      return result.length > 0 ? (result[0] as User) : null
    } catch (error) {
      console.error("Error finding user by Google ID:", error)
      return null
    }
  }

  static async updateGoogleUser(userId: string, data: { google_id: string; avatar_url?: string }): Promise<User> {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    const result = await sql`
      UPDATE users 
      SET google_id = ${data.google_id}, 
          avatar_url = ${data.avatar_url || null},
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `

    return result[0] as User
  }

  static async signIn(signInData: SignInData): Promise<{ user: User; sessionToken: string }> {
    const { email, password } = signInData

    // Ensure database is initialized
    await ensureDatabaseInitialized();

    // Get user with password hash
    const userResult = await sql`
      SELECT id, email, password_hash, first_name, last_name, phone, company, google_id, avatar_url, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `

    if (userResult.length === 0) {
      throw new Error("Invalid email or password")
    }

    const user = userResult[0]

    // Check if user has a password (not Google-only account)
    if (!user.password_hash) {
      throw new Error("This account uses Google sign-in. Please use the 'Login with Google' option.")
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    // Generate session token
    const sessionToken = await this.createSession(user.id)

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword as User,
      sessionToken,
    }
  }

  static async createSession(userId: string): Promise<string> {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    const sessionToken = this.generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    console.log("Creating session for user:", userId, "with token:", sessionToken.substring(0, 10) + "...")

    // Clean up any existing sessions for this user first
    await sql`
      DELETE FROM sessions WHERE user_id = ${userId}
    `

    // Store new session
    await sql`
      INSERT INTO sessions (user_id, token, expires_at, created_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt}, NOW())
    `

    console.log("Session created successfully")

    // Clean up expired sessions
    await this.cleanupExpiredSessions()

    return sessionToken
  }

  static async verifySession(sessionToken: string, response?: NextResponse): Promise<User | null> {
    try {
      // Ensure database is initialized
      await ensureDatabaseInitialized();

      console.log("Verifying session token:", sessionToken.substring(0, 10) + "...")

      const result = await sql`
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.company, u.google_id, u.avatar_url, u.created_at, u.updated_at,
               s.expires_at
        FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.token = ${sessionToken}
      `

      console.log("Session query result:", result.length > 0 ? "found" : "not found")

      if (result.length === 0) {
        console.log("No session found for token")
        if (response) {
          response.cookies.delete("session_token")
          console.log("Cleared invalid session token cookie.")
        }
        return null
      }

      const sessionData = result[0]
      const now = new Date()
      const expiresAt = new Date(sessionData.expires_at)

      console.log("Session expires at:", expiresAt, "Current time:", now)

      if (expiresAt <= now) {
        console.log("Session has expired")
        // Clean up expired session
        await sql`
          DELETE FROM sessions WHERE token = ${sessionToken}
        `
        if (response) {
          response.cookies.delete("session_token")
          console.log("Cleared expired session token cookie.")
        }
        return null
      }

      console.log("Session is valid for user:", sessionData.email)
      return sessionData as User
    } catch (error) {
      console.error("Error verifying session:", error)
      if (response) {
        response.cookies.delete("session_token")
        console.log("Cleared session token cookie due to verification error.")
      }
      return null
    }
  }

  static async signOut(sessionToken: string): Promise<void> {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    await sql`
      DELETE FROM sessions WHERE token = ${sessionToken}
    `
  }

  static async cleanupExpiredSessions(): Promise<void> {
    try {
      // Ensure database is initialized
      await ensureDatabaseInitialized();

      const result = await sql`
        DELETE FROM sessions WHERE expires_at < NOW()
      `
      console.log("Cleaned up expired sessions:", result.length)
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error)
    }
  }

  static async createGoogleUser(googleData: {
    google_id: string
    email: string
    first_name: string
    last_name: string
    avatar_url?: string
  }): Promise<User> {
    try {
      // Ensure database is initialized
      await ensureDatabaseInitialized();

      // Check if user already exists by email
      const existingUser = await this.findUserByEmail(googleData.email)

      if (existingUser) {
        // Update existing user with Google ID if not already set
        if (!existingUser.google_id) {
          const result = await sql`
            UPDATE users 
            SET google_id = ${googleData.google_id}, 
                avatar_url = ${googleData.avatar_url || null},
                updated_at = NOW()
            WHERE email = ${googleData.email}
            RETURNING *
          `
          return result[0] as User
        }
        return existingUser
      }

      // Create new user with Google data
      return await this.createUser({
        email: googleData.email,
        first_name: googleData.first_name,
        last_name: googleData.last_name,
        google_id: googleData.google_id,
        avatar_url: googleData.avatar_url,
      })
    } catch (error: any) {
      console.error("Error creating Google user:", error)
      throw new Error(error.message || "Failed to create Google user")
    }
  }

  private static generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }
}
