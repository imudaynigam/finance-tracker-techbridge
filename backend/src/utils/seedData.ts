import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Category } from '../models/Category';
import bcrypt from 'bcryptjs';

export async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected for seeding');

    const userRepository = AppDataSource.getRepository(User);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Check if data already exists
    const existingUsers = await userRepository.count();
    const existingCategories = await categoryRepository.count();

    if (existingUsers > 0 && existingCategories > 0) {
      console.log('ℹ️ Data already seeded, skipping...');
      return;
    }

    // Seed categories
    const categories = [
      { name: 'Salary', description: 'Income from salary', color: '#22c55e' },
      { name: 'Freelance', description: 'Freelance income', color: '#3b82f6' },
      { name: 'Investment', description: 'Investment returns', color: '#8b5cf6' },
      { name: 'Food', description: 'Food and dining expenses', color: '#ef4444' },
      { name: 'Transport', description: 'Transportation costs', color: '#f97316' },
      { name: 'Shopping', description: 'Shopping expenses', color: '#ec4899' },
      { name: 'Bills', description: 'Utility bills and subscriptions', color: '#6b7280' },
      { name: 'Entertainment', description: 'Entertainment and leisure', color: '#06b6d4' },
      { name: 'Healthcare', description: 'Medical and healthcare expenses', color: '#84cc16' },
      { name: 'Education', description: 'Education and training costs', color: '#f59e0b' }
    ];

    for (const categoryData of categories) {
      const existingCategory = await categoryRepository.findOne({ where: { name: categoryData.name } });
      if (!existingCategory) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
        console.log(`✅ Created category: ${categoryData.name}`);
      }
    }

    // Seed demo users
    const demoUsers = [
      {
        email: 'admin@demo.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN
      },
      {
        email: 'user@demo.com',
        password: 'user123',
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER
      },
      {
        email: 'view@demo.com',
        password: 'view123',
        firstName: 'Read',
        lastName: 'Only',
        role: UserRole.READ_ONLY
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = userRepository.create({
          ...userData,
          password: hashedPassword
        });
        await userRepository.save(user);
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
} 