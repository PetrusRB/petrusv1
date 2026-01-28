import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'MODERATOR']);
export const usersTable = pgTable(
  'user',
  {
    // IDs e identificadores
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()), // Gera UUID

    clerkUserId: text('clerk_user_id').unique(),
    email: text('email').unique(),
    username: text('username').unique(),
    displayName: text('display_name'),
    pictureUrl: text('picture_url'),
    bio: text('bio'),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),

    // Status e preferências
    isActive: boolean('is_active').default(true),
    lastLoginAt: timestamp('last_login_at'),
    role: roleEnum('role').default('USER'),
  },
  (table) => ({
    // Índices definidos em Prisma
    emailIdx: index('email_idx').on(table.email),
    usernameIdx: index('username_idx').on(table.username),
    clerkUserIdIdx: index('clerk_user_id_idx').on(table.clerkUserId),

    // Índices de performance
    isActiveIdx: index('is_active_idx').on(table.isActive),
    roleIdx: index('role_idx').on(table.role),
  })
);

export const discordTokensTable = pgTable('discord_token', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),

  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  scope: text('scope').notNull(),
  tokenType: text('token_type').notNull(),

  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),

  discordId: text('discord_id').notNull(),
  username: text('username'),
  discriminator: text('discriminator'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type DiscordToken = typeof discordTokensTable.$inferSelect;
export type NewDiscordToken = typeof discordTokensTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ one }) => ({
  discordToken: one(discordTokensTable, {
    fields: [usersTable.id],
    references: [discordTokensTable.userId],
  }),
}));

export const discordTokensRelations = relations(
  discordTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [discordTokensTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const sessionsTable = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tipagems
export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
