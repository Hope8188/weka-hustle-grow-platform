import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  phoneVerified: integer("phone_verified", { mode: "boolean" })
    .$defaultFn(() => false),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Business tables for Weka business management
export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  duration: text('duration'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').notNull(),
});

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  location: text('location'),
  totalSpent: integer('total_spent').default(0).notNull(),
  lastServiceDate: text('last_service_date'),
  notes: text('notes'),
  status: text('status').default('active').notNull(),
  createdAt: text('created_at').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  mpesaReceipt: text('mpesa_receipt'),
  amount: integer('amount').notNull(),
  phone: text('phone').notNull(),
  transactionType: text('transaction_type').notNull(),
  serviceId: integer('service_id').references(() => services.id, { onDelete: 'set null' }),
  description: text('description'),
  transactionDate: text('transaction_date').notNull(),
  status: text('status').default('completed').notNull(),
  createdAt: text('created_at').notNull(),
});

export const mpesaConfig = sqliteTable('mpesa_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  mpesaPhone: text('mpesa_phone').notNull(),
  businessName: text('business_name').notNull(),
  paybillNumber: text('paybill_number'),
  tillNumber: text('till_number'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const serviceRequests = sqliteTable('service_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerLocation: text('customer_location').notNull(),
  serviceCategory: text('service_category').notNull(),
  description: text('description').notNull(),
  budget: integer('budget'),
  status: text('status').default('open').notNull(),
  matchedProviderId: text('matched_provider_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
  matchedAt: text('matched_at'),
  responseTime: integer('response_time'),
});

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerUserId: text('provider_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  customerUserId: text('customer_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  serviceRequestId: integer('service_request_id').references(() => serviceRequests.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  verifiedPurchase: integer('verified_purchase', { mode: 'boolean' }).default(false).notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  profileCompletionScore: integer('profile_completion_score').default(0).notNull(),
  portfolioItems: text('portfolio_items', { mode: 'json' }),
  skills: text('skills', { mode: 'json' }),
  location: text('location'),
  yearsOfExperience: integer('years_of_experience'),
  verifiedPhone: integer('verified_phone', { mode: 'boolean' }).default(false).notNull(),
  verifiedId: integer('verified_id', { mode: 'boolean' }).default(false).notNull(),
  totalReviews: integer('total_reviews').default(0).notNull(),
  averageRating: real('average_rating'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// New comprehensive reviews and ratings tables
export const reviewsTable = sqliteTable('reviews_table', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  reviewerId: text('reviewer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  reviewerName: text('reviewer_name').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  comment: text('comment').notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  verifiedPurchase: integer('verified_purchase', { mode: 'boolean' }).default(false).notNull(),
  providerResponse: text('provider_response'),
  responseDate: text('response_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const reviewHelpful = sqliteTable('review_helpful', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reviewId: integer('review_id').notNull().references(() => reviewsTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});