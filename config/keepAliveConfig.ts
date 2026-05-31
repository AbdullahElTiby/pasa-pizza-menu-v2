// Keep-alive configuration for Supabase pause prevention
// Adapted from: https://github.com/travisvn/supabase-pause-prevention

export type KeepAliveConfig = typeof keepAliveConfig;

export const keepAliveConfig = {
  // Table in Supabase dedicated to keep-alive pings
  table: 'keep_alive',

  // Column queried with a random string (never matches, but counts as DB activity)
  column: 'name',

  // How often to ping (milliseconds) while the app is open
  intervalMs: 30 * 60 * 1000, // 30 minutes

  // Insert/delete cycling: keeps the table bounded
  allowInsertionAndDeletion: true,

  // Max rows before cleanup deletes the oldest entry
  sizeBeforeDeletions: 10,

  // Length of the random string generated for each ping
  randomStringLength: 12,

  // Log errors to console
  consoleLogOnError: true,
};