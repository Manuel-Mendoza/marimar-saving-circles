import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { groups } from "./groups";
import { users } from "./users";

// Draw sessions table for SSE functionality
export const drawSessions = pgTable("draw_sessions", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("PENDING"), // PENDING, IN_PROGRESS, COMPLETED
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  finalPositions: jsonb("final_positions").notNull(), // Array of final positions
  currentStep: integer("current_step").default(0), // Current animation step
  totalSteps: integer("total_steps").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Indexes for draw sessions
export const drawSessionsIndexes = {
  // Index for active sessions by group
  groupId: "idx_draw_sessions_group_id",
  // Index for sessions by admin
  adminId: "idx_draw_sessions_admin_id",
  // Index for sessions by status
  status: "idx_draw_sessions_status",
  // Composite index for active sessions
  groupStatus: "idx_draw_sessions_group_status",
};

// Constraints for draw sessions
export const drawSessionsConstraints = {
  // Unique active session per group
  uniqueActiveSession: "unique_active_session_per_group",
};

// Types
export type DrawSession = typeof drawSessions.$inferSelect;
export type NewDrawSession = typeof drawSessions.$inferInsert;