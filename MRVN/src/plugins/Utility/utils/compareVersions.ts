export async function compareVersions(newer: string, older: string): Promise<boolean> {
  const newerParts: string[] = newer.split(".");
  const olderParts: string[] = older.split(".");

  for (let i: number = 0; i < Math.max(newerParts.length, olderParts.length); i++) {
    const newerPart: number = parseInt((newerParts[i] || "0").match(/\d+/)[0] || "0", 10);
    const olderPart: number = parseInt((olderParts[i] || "0").match(/\d+/)[0] || "0", 10);
    if (newerPart > olderPart) {
      return true;
    }
    if (newerPart < olderPart) {
      return false;
    }
  }

  return false;
}
