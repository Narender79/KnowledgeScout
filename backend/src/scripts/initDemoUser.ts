import bcrypt from 'bcryptjs';
import databaseService from '../services/databaseService';

export async function initializeDemoUser() {
  try {
    const demoEmail = 'admin@mail.com';
    
    // Check if demo user already exists
    const existingUser = await databaseService.findUserByEmail(demoEmail);
    if (existingUser) {
      console.log('✅ Demo user already exists:', demoEmail);
      return existingUser;
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const demoUser = await databaseService.createUser({
      name: 'Demo Admin',
      email: demoEmail,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=Demo+Admin&background=0ea5e9&color=fff`
    });

    console.log('✅ Demo user created successfully:', demoEmail);
    return demoUser;
  } catch (error) {
    console.error('❌ Failed to initialize demo user:', error);
    throw error;
  }
}
