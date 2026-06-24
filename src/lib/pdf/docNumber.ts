export function formatDocNumber(prefix: string, sequence: number) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(6, "0")}`;
}
