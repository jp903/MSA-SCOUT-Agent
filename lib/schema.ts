import { pgTable, uuid, varchar, timestamp, integer, decimal, text, jsonb, boolean, date, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Define enums that might be used
export const userRole = pgEnum('user_role', ['user', 'admin', 'superuser']);
export const propertyStatus = pgEnum('property_status', ['owned', 'sold', 'rented', 'for_sale']);
export const documentStatus = pgEnum('document_status', ['processed', 'processing', 'failed']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  company: varchar('company', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  googleId: varchar('google_id', { length: 255 }),
  avatarUrl: text('avatar_url'),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
});

// Properties table
export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  purchasePrice: decimal('purchase_price', { precision: 12, scale: 2 }).notNull(),
  purchaseDate: date('purchase_date'),
  currentValue: decimal('current_value', { precision: 12, scale: 2 }).notNull(),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }).notNull(),
  monthlyExpenses: decimal('monthly_expenses', { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal('down_payment', { precision: 12, scale: 2 }).notNull(),
  loanAmount: decimal('loan_amount', { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal('interest_rate', { precision: 5, scale: 3 }).notNull(),
  loanTermYears: integer('loan_term_years').notNull(),
  propertyType: varchar('property_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('owned').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Property images table
export const propertyImages = pgTable('property_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  caption: text('caption'),
  isPrimary: boolean('is_primary').default(false),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
});

// Chat history table
export const chatHistory = pgTable('chat_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  messages: jsonb('messages').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Property ROE Documents table
export const propertyRoiDocuments = pgTable('property_roi_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  fileKey: varchar('file_key', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  uploadDate: timestamp('upload_date', { withTimezone: true }).defaultNow().notNull(),
  status: documentStatus('status').default('processed'),
  analysisResults: jsonb('analysis_results'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => sql`NOW()`)
    .notNull(),
});