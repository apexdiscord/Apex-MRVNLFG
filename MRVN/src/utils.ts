export function successMessage(str) {
    return `👌 ${str}`;
}

export function errorMessage(str) {
    return `⚠ ${str}`;
}

export function trimLines(str: string) {
    return str
        .trim()
        .split("\n")
        .map(l => l.trim())
        .join("\n")
        .trim();
}