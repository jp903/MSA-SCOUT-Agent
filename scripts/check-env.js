#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Checking environment variables...\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.log("❌ .env.local file not found!")
  console.log("📝 Please copy .env.example to .env.local and fill in your values")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: envPath })

const requiredVars = ["RAPIDAPI_KEY", "DATABASE_URL", "NEXTAUTH_SECRET"]

const optionalVars = ["RENTCAST_API_KEY", "FRED_API_KEY", "NEXT_PUBLIC_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]

let allGood = true

console.log("✅ Required Variables:")
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`   ${varName}: ${value.substring(0, 8)}...`)
  } else {
    console.log(`   ❌ ${varName}: NOT SET`)
    allGood = false
  }
})

console.log("\n📋 Optional Variables:")
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`   ${varName}: ${value.substring(0, 8)}...`)
  } else {
    console.log(`   ⚪ ${varName}: Not set (optional)`)
  }
})

console.log("\n" + "=".repeat(50))

if (allGood) {
  console.log("✅ All required environment variables are set!")
  console.log("🚀 You can now run the application")
} else {
  console.log("❌ Some required environment variables are missing")
  console.log("📖 Please check docs/ENVIRONMENT_SETUP.md for setup instructions")
  process.exit(1)
}

// Additional checks
console.log("\n🔧 Additional Checks:")

// Check RapidAPI key format
const rapidApiKey = process.env.RAPIDAPI_KEY
if (rapidApiKey) {
  if (rapidApiKey.length < 20) {
    console.log("   ⚠️  RAPIDAPI_KEY seems too short - please verify")
  } else {
    console.log("   ✅ RAPIDAPI_KEY format looks good")
  }
}

// Check database URL format
const dbUrl = process.env.DATABASE_URL
if (dbUrl) {
  if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
    console.log("   ✅ DATABASE_URL format looks good")
  } else {
    console.log("   ⚠️  DATABASE_URL should start with postgresql:// or postgres://")
  }
}

// Check NextAuth secret
const nextAuthSecret = process.env.NEXTAUTH_SECRET
if (nextAuthSecret) {
  if (nextAuthSecret.length < 32) {
    console.log("   ⚠️  NEXTAUTH_SECRET should be at least 32 characters long")
  } else {
    console.log("   ✅ NEXTAUTH_SECRET length looks good")
  }
}

console.log("\n🎯 Next Steps:")
console.log("   1. Run: npm run rapidapi:check")
console.log("   2. Run: npm run api:test")
console.log("   3. Start the app: npm run dev")
