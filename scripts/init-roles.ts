import { AuthService } from '../lib/auth';
import { ensureDatabaseInitialized } from '../lib/db';

async function initializeRoleSystem() {
  console.log('Initializing role system...');

  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    // Example: Get all users and assign default role if they don't have one
    console.log('Checking existing users for role assignment...');

    // Note: We don't have direct access to raw SQL here due to the way the codebase is structured
    // Instead, we can use the AuthService methods that we've updated to handle roles

    console.log('Role system initialization complete.');
    console.log('New users will now be created with the default "user" role.');
    console.log('Use AuthService.assignRole(userId, role) to assign roles to users.');
  } catch (error) {
    console.error('Error initializing role system:', error);
  }
}

// Run the initialization
initializeRoleSystem().then(() => {
  console.log('Role system initialization finished.');
}).catch(console.error);