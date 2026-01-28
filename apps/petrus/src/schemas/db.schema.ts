import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

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

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
