export function generateReportNumber(id: string) {
  const year = new Date().getFullYear();
  const short = id.slice(0, 6).toUpperCase();
  return `RPT-${year}-${short}`;
}