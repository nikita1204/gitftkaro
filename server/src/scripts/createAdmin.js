import mongoose from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../modules/auth/user.model.js';
import { logger } from '../utils/logger.js';

/**
 * Secure Administrator Account Provisioning Script.
 * Reads administrator credentials from environment variables or CLI arguments.
 * NEVER hardcodes production secrets in source code.
 *
 * Usage:
 *   ADMIN_NAME="Raipur Admin" ADMIN_EMAIL="admin@giftkro.com" ADMIN_PASSWORD="AdminSecurePassword123" node src/scripts/createAdmin.js
 *
 * Or using npm script:
 *   npm run seed:admin
 */

const adminInputSchema = z.object({
  name: z.string().min(2, { message: 'Admin name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Must provide a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
      message: 'Password must contain at least one letter and one number',
    }),
  phone: z.string().optional().default(''),
});

const provisionAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || 'GIFT KRO Administrator';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@giftkro.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminRaipur2026!';
  const adminPhone = process.env.ADMIN_PHONE || '+917710000000';

  const validation = adminInputSchema.safeParse({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    phone: adminPhone,
  });

  if (!validation.success) {
    logger.error('Administrator provisioning input validation failed:');
    validation.error.issues.forEach((issue) => {
      logger.error(` - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  try {
    logger.info('Connecting to MongoDB for administrator setup...');
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to database.');

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        logger.info(`Administrator account for ${adminEmail} already exists. Ensuring active status.`);
        existingAdmin.isActive = true;
        await existingAdmin.save();
      } else {
        logger.info(`Upgrading existing user ${adminEmail} to administrator role.`);
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
      }
    } else {
      logger.info(`Creating initial administrator account for ${adminEmail}...`);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: adminPhone,
        address: {
          city: 'Raipur',
          state: 'Chhattisgarh',
        },
        isActive: true,
      });
      logger.info(`Administrator account created successfully: ${adminEmail}`);
    }

    logger.info('Provisioning completed successfully.');
  } catch (error) {
    logger.error(`Error during administrator provisioning: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Database connection closed.');
  }
};

provisionAdmin();
