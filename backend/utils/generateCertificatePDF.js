const PDFDocument = require('pdfkit');

/**
 * Generates a landscape participation certificate PDF for an attendee.
 * Returns the PDFDocument (readable stream) — caller pipes it to a response.
 */
const generateCertificatePDF = ({ user, event, orgSettings }) => {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

  const { width, height } = doc.page;

  // -------- Border --------
  doc.lineWidth(3).strokeColor('#4f46e5').rect(20, 20, width - 40, height - 40).stroke();
  doc.lineWidth(1).strokeColor('#a5b4fc').rect(30, 30, width - 60, height - 60).stroke();

  // -------- Header --------
  doc
    .fillColor('#4f46e5')
    .fontSize(30)
    .font('Helvetica-Bold')
    .text('সনদপত্র', 0, 70, { align: 'center' });

  doc
    .fillColor('#6b7280')
    .fontSize(13)
    .font('Helvetica')
    .text('Certificate of Participation', { align: 'center' });

  doc.moveDown(2);
  doc
    .fillColor('#374151')
    .fontSize(14)
    .text('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে', { align: 'center' });

  doc.moveDown(0.5);
  doc
    .fillColor('#1f2937')
    .fontSize(26)
    .font('Helvetica-Bold')
    .text(user.fullName, { align: 'center' });

  doc.moveDown(0.5);
  doc
    .fillColor('#374151')
    .fontSize(14)
    .font('Helvetica')
    .text(
      `${orgSettings.orgName || 'ISHAS Organization'} আয়োজিত "${event.title}" অনুষ্ঠানে সফলভাবে অংশগ্রহণ করেছেন।`,
      100,
      doc.y + 10,
      { align: 'center', width: width - 200 }
    );

  doc.moveDown(1);
  doc
    .fontSize(11)
    .fillColor('#6b7280')
    .text(
      `তারিখ: ${new Date(event.startDate).toLocaleDateString('bn-BD')} — ${new Date(event.endDate).toLocaleDateString('bn-BD')}`,
      { align: 'center' }
    );

  // -------- Signatures --------
  const sigY = height - 110;
  doc.strokeColor('#9ca3af');
  doc.moveTo(120, sigY).lineTo(300, sigY).stroke();
  doc.fillColor('#1f2937').fontSize(11).text('সভাপতির স্বাক্ষর', 120, sigY + 8, { width: 180, align: 'center' });

  doc.moveTo(width - 300, sigY).lineTo(width - 120, sigY).stroke();
  doc
    .fillColor('#1f2937')
    .fontSize(11)
    .text('সাধারণ সম্পাদকের স্বাক্ষর', width - 300, sigY + 8, { width: 180, align: 'center' });

  doc.end();
  return doc;
};

module.exports = generateCertificatePDF;
