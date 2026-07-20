const PDFDocument = require('pdfkit');

/**
 * Builds a simple, professional tabular PDF report and returns the
 * PDFDocument (readable stream) for the caller to pipe to a response.
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.subtitle]
 * @param {{ header: string, key: string, width: number }[]} params.columns
 * @param {Object[]} params.rows
 * @param {string} [params.orgName]
 */
const generateTableReportPDF = ({ title, subtitle, columns, rows, orgName = 'ISHAS Organization' }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });

  // -------- Header --------
  doc.fillColor('#4f46e5').fontSize(18).font('Helvetica-Bold').text(orgName, { align: 'center' });
  doc.fillColor('#1f2937').fontSize(14).text(title, { align: 'center' });
  if (subtitle) {
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(subtitle, { align: 'center' });
  }
  doc.moveDown(1);

  const tableTop = doc.y;
  const startX = 40;
  let cursorX = startX;

  // -------- Table Header --------
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.rect(startX, tableTop, columns.reduce((sum, c) => sum + c.width, 0), 22).fill('#4f46e5');
  doc.fillColor('#ffffff');
  columns.forEach((col) => {
    doc.text(col.header, cursorX + 4, tableTop + 6, { width: col.width - 8, align: 'left' });
    cursorX += col.width;
  });

  // -------- Table Rows --------
  let cursorY = tableTop + 22;
  const rowHeight = 20;
  const pageBottom = doc.page.height - 50;

  doc.font('Helvetica').fontSize(8.5);

  rows.forEach((row, idx) => {
    if (cursorY + rowHeight > pageBottom) {
      doc.addPage({ size: 'A4', margin: 40, layout: 'landscape' });
      cursorY = 40;
    }

    if (idx % 2 === 0) {
      doc
        .rect(startX, cursorY, columns.reduce((sum, c) => sum + c.width, 0), rowHeight)
        .fill('#f9fafb');
    }
    doc.fillColor('#1f2937');

    cursorX = startX;
    columns.forEach((col) => {
      const value = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
      doc.text(value, cursorX + 4, cursorY + 5, { width: col.width - 8, align: 'left' });
      cursorX += col.width;
    });

    cursorY += rowHeight;
  });

  doc
    .fontSize(8)
    .fillColor('#9ca3af')
    .text(`জেনারেট করা হয়েছে: ${new Date().toLocaleString('bn-BD')}`, startX, doc.page.height - 35);

  doc.end();
  return doc;
};

module.exports = generateTableReportPDF;
