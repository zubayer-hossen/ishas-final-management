const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');

const CATEGORY_LABELS = {
  monthly_chada: 'মাসিক চাঁদা',
  donation: 'অনুদান',
  emergency_fund: 'জরুরি তহবিল',
  special_fund: 'বিশেষ তহবিল',
  other_income: 'অন্যান্য আয়',
  expense: 'খরচ',
};

// ইংরেজি সংখ্যাকে বাংলায় রূপান্তর
const toBanglaNum = (num) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (digit) => banglaDigits[parseInt(digit, 10)]);
};

// ওয়াটারমার্ক
const drawWatermark = (doc, text) => {
  doc.save();
  doc.fillOpacity(0.04);
  doc.fontSize(55).font('Bangla-Bold').fillColor('#4f46e5');
  doc.rotate(-35, { origin: [300, 400] });
  doc.text(text, 20, 380, { width: 560, align: 'center' });
  doc.restore();
  doc.fillOpacity(1);
};

/**
 * Builds a professional PDF receipt document for a transaction
 */
const generateReceiptPDF = async ({ transaction, member, orgSettings = {}, verifyUrl }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  // -------- ১. ফন্ট রেজিস্টার --------
  const banglaFontPath = path.join(__dirname, 'fonts', 'NotoSansBengali-Regular.ttf');
  const banglaFontBoldPath = path.join(__dirname, 'fonts', 'NotoSansBengali-Bold.ttf');

  doc.registerFont('Bangla', banglaFontPath);
  doc.registerFont('Bangla-Bold', banglaFontBoldPath);

  // QR কোড বাফার
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    width: 120,
    margin: 1,
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  const orgName = orgSettings.orgName || 'ISHAS Organization';
  const currency = orgSettings.currency || 'BDT';

  // -------- ওয়াটারমার্ক --------
  drawWatermark(doc, orgName);

  // -------- শীর্ষ আলংকারিক বার (Top Accent Bar) --------
  doc.rect(0, 0, doc.page.width, 10).fill('#4f46e5');

  // -------- Header Section --------
  doc
    .fillColor('#4f46e5')
    .fontSize(22)
    .font('Bangla-Bold')
    .text(orgName, 40, 35);

  doc
    .fillColor('#6b7280')
    .fontSize(10)
    .font('Bangla')
    .text('অফিসিয়াল অর্থ প্রাপ্তি রশিদ (Official Payment Receipt)', 40, 65);

  // PAID Badge (ডান কোণায়)
  doc
    .roundedRect(450, 35, 100, 30, 4)
    .fill('#ecfdf5');
  doc
    .strokeColor('#10b981')
    .lineWidth(1)
    .roundedRect(450, 35, 100, 30, 4)
    .stroke();
  doc
    .fillColor('#047857')
    .fontSize(11)
    .font('Bangla-Bold')
    .text('✓ পরিশোধিত', 450, 43, { width: 100, align: 'center' });

  // ডিভাইডার লাইন
  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(40, 100)
    .lineTo(555, 100)
    .stroke();

  // -------- ইনফরমেশন গ্রিড (২ টি কলাম কার্ড) --------
  const cardY = 115;
  const cardWidth = 250;

  // বাম কার্ড: ট্রানজ্যাকশন সংক্রান্ত তথ্য
  doc
    .roundedRect(40, cardY, cardWidth, 100, 6)
    .fill('#f9fafb');
  doc
    .fillColor('#4f46e5')
    .fontSize(11)
    .font('Bangla-Bold')
    .text('রশিদ ও ট্রানজ্যাকশন বিবরণী', 52, cardY + 10);

  const formattedDate = transaction.date
    ? toBanglaNum(new Date(transaction.date).toLocaleDateString('bn-BD'))
    : 'N/A';

  doc
    .fillColor('#374151')
    .fontSize(9.5)
    .font('Bangla')
    .text(`রশিদ নম্বর: ${transaction.transactionId || 'N/A'}`, 52, cardY + 32)
    .text(`তারিখ: ${formattedDate}`, 52, cardY + 48)
    .text(`পেমেন্ট মাধ্যম: ${transaction.paymentMethod || 'N/A'}`, 52, cardY + 64)
    .text(`খাত: ${CATEGORY_LABELS[transaction.category] || transaction.category}`, 52, cardY + 80);

  // ডান কার্ড: সদস্য / প্রদানকারীর তথ্য
  doc
    .roundedRect(305, cardY, cardWidth, 100, 6)
    .fill('#f9fafb');
  doc
    .fillColor('#4f46e5')
    .fontSize(11)
    .font('Bangla-Bold')
    .text('অর্থ প্রদানকারীর বিবরণ', 317, cardY + 10);

  doc
    .fillColor('#374151')
    .fontSize(9.5)
    .font('Bangla')
    .text(`নাম: ${member ? member.fullName : 'সাধারণ প্রদানকারী'}`, 317, cardY + 32)
    .text(`সদস্য আইডি: ${member?.memberId ? toBanglaNum(member.memberId) : 'N/A'}`, 317, cardY + 48)
    .text(`ফোন নম্বর: ${member?.phone ? toBanglaNum(member.phone) : 'N/A'}`, 317, cardY + 64)
    .text(`মাস/ধরন: ${transaction.month || transaction.donationType || 'সাধারণ'}`, 317, cardY + 80);

  // -------- প্রধান পরিমাণ বক্স (Amount Highlight Card) --------
  const amountY = 230;
  doc
    .roundedRect(40, amountY, 515, 65, 8)
    .fill('#eef2ff');
  
  doc
    .strokeColor('#c7d2fe')
    .lineWidth(1)
    .roundedRect(40, amountY, 515, 65, 8)
    .stroke();

  const formattedAmount = `${toBanglaNum(transaction.amount)} ${currency === 'BDT' ? 'টাকা' : currency}`;

  doc
    .fillColor('#374151')
    .fontSize(11)
    .font('Bangla')
    .text('সর্বমোট প্রাপ্ত পরিমাণ:', 60, amountY + 15);

  doc
    .fillColor('#4338ca')
    .fontSize(20)
    .font('Bangla-Bold')
    .text(formattedAmount, 60, amountY + 32);

  // -------- QR Code ও ভেটিফিকেশন বক্স --------
  const qrSectionY = 315;

  // QR কোডের জন্য সাদা ব্যাকগ্রাউন্ড বক্স
  doc
    .roundedRect(40, qrSectionY, 340, 110, 6)
    .fill('#f9fafb');

  doc
    .fillColor('#1f2937')
    .fontSize(10)
    .font('Bangla-Bold')
    .text('অনলাইন ভ্যালিডেশন নির্দেশিকা:', 55, qrSectionY + 15);

  doc
    .fillColor('#6b7280')
    .fontSize(9)
    .font('Bangla')
    .text(
      'এই রশিদের সত্যতা যাচাই করতে ডানপাশের QR কোডটি আপনার মোবাইলের ক্যামেরা দিয়ে স্ক্যান করুন। কোনো অসঙ্গতি পরিলক্ষিত হলে অবিলম্বেই সংস্থাকে অবহিত করুন।',
      55,
      qrSectionY + 35,
      { width: 310 }
    );

  // QR কোড ইমেজ
  doc
    .roundedRect(420, qrSectionY, 135, 110, 6)
    .fill('#ffffff');
  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .roundedRect(420, qrSectionY, 135, 110, 6)
    .stroke();

  doc.image(qrBuffer, 437, qrSectionY + 10, { width: 100 });

  // -------- স্বাক্ষর সেকশন (Signatures) --------
  const sigY = 510;
  doc.strokeColor('#9ca3af').lineWidth(1);

  // কোষাধ্যক্ষের স্বাক্ষর
  doc.moveTo(60, sigY).lineTo(220, sigY).stroke();
  doc
    .fillColor('#374151')
    .fontSize(10)
    .font('Bangla')
    .text('কোষাধ্যক্ষের স্বাক্ষর', 60, sigY + 8, { width: 160, align: 'center' });

  // সভাপতি/প্রতিনিধির স্বাক্ষর
  doc.moveTo(375, sigY).lineTo(535, sigY).stroke();
  doc
    .fillColor('#374151')
    .fontSize(10)
    .font('Bangla')
    .text('সভাপতি / অনুমোদিত স্বাক্ষর', 375, sigY + 8, { width: 160, align: 'center' });

  // -------- কুপন ডিভাইডার ডটেড লাইন (Cutter Line) --------
  const cutLineY = 600;
  doc
    .strokeColor('#d1d5db')
    .lineWidth(1)
    .dash(4, { space: 4 })
    .moveTo(40, cutLineY)
    .lineTo(555, cutLineY)
    .stroke();
  doc.undash(); // ড্যাশ রিসেট

  doc
    .fillColor('#9ca3af')
    .fontSize(8)
    .font('Bangla')
    .text('✂ কম্পিউটার জেনারেটেড রশিদের গ্রাহক কপি', 40, cutLineY - 12, { align: 'right', width: 515 });

  // -------- ফুটার (Footer Notice) --------
  doc
    .fillColor('#9ca3af')
    .fontSize(8.5)
    .font('Bangla')
    .text(
      'এই রশিদটি ইলেকট্রনিকভাবে সফটওয়্যার দ্বারা তৈরি করা হয়েছে। তথ্য যাচাইয়ের জন্য QR কোড ব্যবহার করুন।',
      40,
      doc.page.height - 40,
      { align: 'center', width: 515 }
    );

  doc.end();
  return doc;
};

module.exports = generateReceiptPDF;