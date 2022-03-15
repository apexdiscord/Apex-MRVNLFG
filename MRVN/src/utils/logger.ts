import { DateTime } from "luxon";
/* eslint-disable no-console */

export const logger = {
  info(...args: Parameters<typeof console.log>) {
    console.log(`[INF] [${DateTime.now().toISOTime()}]`, ...args);
  },

  warn(...args: Parameters<typeof console.warn>) {
    console.warn(`[WRN] [${DateTime.now().toISOTime()}]`, ...args);
  },

  error(...args: Parameters<typeof console.error>) {
    console.error(`[ERR] [${DateTime.now().toISOTime()}]`, ...args);
  },

  debug(...args: Parameters<typeof console.log>) {
    console.log(`[DBG] [${DateTime.now().toISOTime()}]`, ...args);
  },

  log(...args: Parameters<typeof console.log>) {
    console.log(`[LOG] [${DateTime.now().toISOTime()}]`, ...args);
  },
};
