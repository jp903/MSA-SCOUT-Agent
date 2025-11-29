import { NextRequest } from 'next/server';
import { AuthService } from '../../../lib/auth';
import { hasPermission } from '../../../lib/role-utils';

export async function GET(request: NextRequest) {
  try {
    // Extract session token from headers or cookies
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                         request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'No session token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user session
    const user = await AuthService.verifySession(sessionToken);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has permission to manage roles
    if (!hasPermission(user.role || 'user', 'manage:roles')) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return basic role information
    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      permissions: ['read:own-properties', 'create:own-properties', 'manage:roles']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in roles GET handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract session token from headers or cookies
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '') ||
                         request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'No session token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user session
    const user = await AuthService.verifySession(sessionToken);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has permission to manage roles
    if (!hasPermission(user.role || 'user', 'manage:roles')) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return new Response(JSON.stringify({ error: 'Missing userId or role in request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Assign role to user
    const updatedUser = await AuthService.assignRole(userId, role);

    return new Response(JSON.stringify({
      message: 'Role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in roles PUT handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}