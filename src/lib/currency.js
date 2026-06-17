const inrFormatter = new Intl.NumberFormat('en-IN');

export function formatINR(value) {
  const normalizedValue = Number(value ?? 0);
  return `₹${inrFormatter.format(Number.isNaN(normalizedValue) ? 0 : normalizedValue)}`;
}
