import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, BRANCHES } from '../config/branches';
import { keepAliveConfig as config } from '../config/keepAliveConfig';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALPHABET_OFFSET = 'a'.charCodeAt(0);

/** Generate a random lowercase alphabetic string. */
export const generateRandomString = (length: number = config.randomStringLength): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(ALPHABET_OFFSET + Math.floor(Math.random() * 26));
  }
  return result;
};

// ── Query types ──────────────────────────────────────────────────────────────

interface QueryResponse {
  successful: boolean;
  message: string;
}

interface QueryResponseWithData extends QueryResponse {
  data: unknown[] | null;
}

// ── Core operations ──────────────────────────────────────────────────────────

/** Query the keep-alive table with a random string that will never match,
 *  which counts as database activity to prevent Supabase from pausing. */
const querySupabase = async (supabase: SupabaseClient): Promise<QueryResponse> => {
  const randomString = generateRandomString();

  const { data, error } = await supabase
    .from(config.table)
    .select('*')
    .eq(config.column, randomString);

  const messageInfo = `Keep-alive: queried '${config.table}' with random string '${randomString}'`;

  if (error) {
    if (config.consoleLogOnError) console.error(`[keep-alive] ${messageInfo}: ${error.message}`);
    return { successful: false, message: `${messageInfo}: ${error.message}` };
  }

  return { successful: true, message: `${messageInfo}: ${JSON.stringify(data)}` };
};

/** Retrieve all entries from the keep-alive table. */
const retrieveEntries = async (supabase: SupabaseClient): Promise<QueryResponseWithData> => {
  const { data, error } = await supabase
    .from(config.table)
    .select(config.column);

  const messageInfo = `Keep-alive: retrieved entries from '${config.table}'`;

  if (error) {
    if (config.consoleLogOnError) console.error(`[keep-alive] ${messageInfo}: ${error.message}`);
    return { successful: false, message: `${messageInfo}: ${error.message}`, data: null };
  }

  return { successful: true, message: `${messageInfo}`, data: data as unknown[] };
};

/** Insert a random entry into the keep-alive table. */
const insertRandom = async (supabase: SupabaseClient, randomString: string): Promise<QueryResponse> => {
  const { error } = await supabase
    .from(config.table)
    .upsert({ [config.column]: randomString });

  const messageInfo = `Keep-alive: inserted '${randomString}' into '${config.table}'`;

  if (error) {
    if (config.consoleLogOnError) console.error(`[keep-alive] ${messageInfo}: ${error.message}`);
    return { successful: false, message: `${messageInfo}: ${error.message}` };
  }

  return { successful: true, message: `${messageInfo}: success` };
};

/** Delete an entry from the keep-alive table by column value. */
const deleteEntry = async (supabase: SupabaseClient, entryValue: unknown): Promise<QueryResponse> => {
  const { error } = await supabase
    .from(config.table)
    .delete()
    .eq(config.column, entryValue);

  const messageInfo = `Keep-alive: deleted '${String(entryValue)}' from '${config.table}'`;

  if (error) {
    if (config.consoleLogOnError) console.error(`[keep-alive] ${messageInfo}: ${error.message}`);
    return { successful: false, message: `${messageInfo}: ${error.message}` };
  }

  return { successful: true, message: `${messageInfo}: success` };
};

/** Determine whether to insert a new entry or delete an old one (keeps the table bounded). */
const determineAction = async (supabase: SupabaseClient): Promise<QueryResponse> => {
  const retrievalResults = await retrieveEntries(supabase);

  if (!retrievalResults.successful) {
    return { successful: false, message: `Failed to retrieve entries: ${retrievalResults.message}` };
  }

  const entries = retrievalResults.data;
  if (!entries) {
    return { successful: false, message: 'Received null data result when retrieving entries' };
  }

  if (entries.length > config.sizeBeforeDeletions) {
    // Table is getting large — delete the oldest entry
    const entryToDelete = entries[entries.length - 1] as Record<string, unknown>;
    return deleteEntry(supabase, entryToDelete[config.column]);
  }

  // Insert a new random entry
  const randomString = generateRandomString();
  return insertRandom(supabase, randomString);
};

// ── Public API ───────────────────────────────────────────────────────────────

/** Run one keep-alive cycle for a single branch. */
const runKeepAlive = async (supabase: SupabaseClient): Promise<boolean> => {
  try {
    let success = true;

    // Always query with a random string (counts as DB activity even if nothing matches)
    const queryResult = await querySupabase(supabase);
    success = success && queryResult.successful;

    // Optionally insert/delete to cycle entries
    if (config.allowInsertionAndDeletion) {
      const actionResult = await determineAction(supabase);
      success = success && actionResult.successful;
    }

    return success;
  } catch (err) {
    if (config.consoleLogOnError) console.error('[keep-alive] Unexpected error:', err);
    return false;
  }
};

let intervalId: ReturnType<typeof setInterval> | null = null;

/** Start the keep-alive service. Pings all branch databases immediately,
 *  then repeats at the configured interval. */
export const startKeepAlive = (): void => {
  // Run immediately on start
  pingAllBranches();

  // Then on interval
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(pingAllBranches, config.intervalMs);

  console.log(`[keep-alive] Service started — pinging every ${config.intervalMs / 60000} minutes`);
};

/** Stop the keep-alive service (e.g. on cleanup). */
export const stopKeepAlive = (): void => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[keep-alive] Service stopped');
  }
};

/** Ping all branch databases once. */
const pingAllBranches = async (): Promise<void> => {
  const branchIds = Object.keys(BRANCHES);

  for (const branchId of branchIds) {
    try {
      const supabase = getSupabaseClient(branchId);
      const success = await runKeepAlive(supabase);
      if (!success && config.consoleLogOnError) {
        console.warn(`[keep-alive] Branch '${branchId}' — some operations failed`);
      }
    } catch (err) {
      if (config.consoleLogOnError) console.error(`[keep-alive] Branch '${branchId}' error:`, err);
    }
  }
};