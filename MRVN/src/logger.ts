import moment from "moment-timezone";
/* eslint-disable no-console */

export const logger = {
  info(...args: Parameters<typeof console.log>) {
    console.log(`[INF] [${moment.utc().toISOString()}]`, ...args);
  },

  warn(...args: Parameters<typeof console.warn>) {
    console.warn(`[WRN] [${moment.utc().toISOString()}]`, ...args);
  },

  error(...args: Parameters<typeof console.error>) {
    console.error(`[ERR] [${moment.utc().toISOString()}]`, ...args);
  },

  debug(...args: Parameters<typeof console.log>) {
    console.log(`[DBG] [${moment.utc().toISOString()}]`, ...args);
  },

  log(...args: Parameters<typeof console.log>) {
    console.log(`[LOG] [${moment.utc().toISOString()}]`, ...args);
  },
};
