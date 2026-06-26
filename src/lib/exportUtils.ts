export function escapeCsvValue(value: unknown) {
  const raw = value === undefined || value === null ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

export function buildCsv(rows: Record<string, unknown>[], headers: string[]) {
  const lines = [headers.map(escapeCsvValue).join(",")];
  for (const row of rows) {
    const line = headers
      .map((header) => escapeCsvValue(row[header] ?? ""))
      .join(",");
    lines.push(line);
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportElementToPdf(element: HTMLElement, filename = "report.pdf") {
  if (!element) return;

  element.classList.add("pdf-safe");

  try {
    const html2canvasModule = await import("html2canvas");
    const jspdfModule = await import("jspdf");
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const { jsPDF } = jspdfModule;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "landscape" });
    const margin = 36;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = margin;
    pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  } finally {
    element.classList.remove("pdf-safe");
  }
}

export function printElement(element: HTMLElement) {
  if (!element) return;
  
  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Unable to open print window. Please check your popup settings.");
    }

    const styles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: #1f2937;
          background: #ffffff;
          line-height: 1.6;
        }
        
        .print-container {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1, h2, h3, p {
          margin-bottom: 12px;
        }
        
        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          border-bottom: 3px solid #059669;
          padding-bottom: 12px;
        }
        
        h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        
        p {
          color: #6b7280;
          font-size: 14px;
        }
        
        .report-header {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .summary-card {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }
        
        .summary-card p {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .summary-card .value {
          font-size: 20px;
          font-weight: 700;
          color: #059669;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-size: 13px;
        }
        
        table thead {
          background: #f3f4f6;
          border-top: 2px solid #d1d5db;
          border-bottom: 2px solid #d1d5db;
        }
        
        table th {
          padding: 12px;
          font-weight: 600;
          text-align: left;
          color: #1f2937;
        }
        
        table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        
        table tbody tr:last-child td {
          border-bottom: 2px solid #d1d5db;
        }
        
        table tbody tr:nth-child(odd) {
          background: #fafafa;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .badge-orange {
          background: #fed7aa;
          color: #92400e;
        }
        
        .badge-blue {
          background: #bfdbfe;
          color: #1e40af;
        }
        
        .print-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            padding: 20px;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Print Report</title>
          ${styles}
        </head>
        <body>
          <div class="print-container">
            ${element.outerHTML}
            <div class="print-footer">
              Generated on ${new Date().toLocaleString()} • GERPAS ERP System
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  } catch (error) {
    console.error("Print error:", error);
    throw new Error("Failed to open print window. Please check your popup settings.");
  }
}


export function formatCurrency(value: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
