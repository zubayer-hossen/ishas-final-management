const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const CATEGORY_LABELS = {
  monthly_chada: 'মাসিক চাঁদা',
  donation: 'অনুদান',
  emergency_fund: 'জরুরি তহবিল',
  special_fund: 'বিশেষ তহবিল',
  other_income: 'অন্যান্য আয়',
  expense: 'খরচ',
};

/**
 * Draws a large diagonal watermark text across the page.
 */
const drawWatermark = (doc, text) => {
  doc.save();
  doc.fillOpacity(0.06);
  doc.fontSize(60).fillColor('#4f46e5');
  doc.rotate(-35, { origin: [300, 400] });
  doc.text(text, 40, 380, { width: 600, align: 'center' });
  doc.restore();
  doc.fillOpacity(1);
};

/**
 * Builds a PDF receipt document for a transaction and returns the PDFDocument
 * instance (a readable stream) — caller is responsible for piping it to a
 * response or file.
 *
 * @param {Object} params
 * @param {Object} params.transaction - Transaction mongoose document
 * @param {Object} params.member - User document (may be null for general expense)
 * @param {Object} params.orgSettings - OrgSettings document
 * @param {string} params.verifyUrl - Public URL to verify this receipt via QR
 */
const generateReceiptPDF = async ({ transaction, member, orgSettings, verifyUrl }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 140, margin: 1 });

  // -------- Watermark --------
  drawWatermark(doc, orgSettings.orgName || 'ISHAS');

  // -------- Header --------
  doc
    .fillColor('#4f46e5')
    .fontSize(22)
    .text(orgSettings.orgName || 'ISHAS Organization', 50, 50, { align: 'center' });

  doc
    .fillColor('#6b7280')
    .fontSize(11)
    .text('অফিসিয়াল রশিদ / Official Receipt', { align: 'center' });

  doc.moveDown(1.5);
  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(1);

  // -------- Transaction Info Table --------
  const startY = doc.y;
  const rowHeight = 26;
  const labelX = 60;
  const valueX = 250;

  const rows = [
    ['রশিদ নম্বর', transaction.transactionId],
    ['তারিখ', new Date(transaction.date).toLocaleDateString('bn-BD')],
    ['খাত', CATEGORY_LABELS[transaction.category] || transaction.category],
    ...(transaction.month ? [['মাস', transaction.month]] : []),
    ...(transaction.donationType ? [['ধরন', transaction.donationType]] : []),
    ['সদস্যের নাম', member ? member.fullName : 'N/A'],
    ['সদস্য আইডি', member?.memberId || 'N/A'],
    ['ফোন', member?.phone || 'N/A'],
    ['পেমেন্ট মাধ্যম', transaction.paymentMethod],
    ['পরিমাণ', `${transaction.amount} ${orgSettings.currency || 'BDT'}`],
  ];

  doc.fontSize(11).fillColor('#1f2937');
  rows.forEach(([label, value], idx) => {
    const y = startY + idx * rowHeight;
    if (idx % 2 === 0) {
      doc.rect(50, y - 4, 495, rowHeight).fill('#f9fafb');
      doc.fillColor('#1f2937');
    }
    doc.font('Helvetica-Bold').text(label, labelX, y, { continued: false });
    doc.font('Helvetica').text(String(value), valueX, y);
  });

  const tableBottom = startY + rows.length * rowHeight + 20;

  // -------- Amount highlight box --------
  doc
    .roundedRect(50, tableBottom, 495, 50, 8)
    .fill('#eef2ff');
  doc
    .fillColor('#4338ca')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(
      `মোট প্রাপ্ত পরিমাণ: ${transaction.amount} ${orgSettings.currency || 'BDT'}`,
      70,
      tableBottom + 16
    );

  // -------- QR Code --------
  const qrY = tableBottom + 80;
  doc.image(qrBuffer, 420, qrY, { width: 110 });
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .font('Helvetica')
    .text('QR স্ক্যান করে যাচাই করুন', 400, qrY + 115, { width: 150, align: 'center' });

  // -------- Signatures --------
  const sigY = qrY + 60;
  doc.fontSize(11).fillColor('#1f2937');
  doc.moveTo(60, sigY + 40).lineTo(220, sigY + 40).stroke();
  doc.text('কোষাধ্যক্ষের স্বাক্ষর', 60, sigY + 45);

  doc.moveTo(240, sigY + 40).lineTo(400, sigY + 40).stroke();
  doc.text('প্রেসিডেন্ট/সভাপতির স্বাক্ষর', 240, sigY + 45);

  // -------- Footer --------
  doc
    .fontSize(9)
    .fillColor('#9ca3af')
    .text(
      'এই রশিদটি ইলেকট্রনিকভাবে জেনারেট করা হয়েছে এবং স্বাক্ষর ছাড়াই বৈধ।',
      50,
      770,
      { align: 'center', width: 495 }
    );

  doc.end();

  return doc;
};

module.exports = generateReceiptPDF;
