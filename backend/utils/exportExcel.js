const ExcelJS = require('exceljs');

/**
 * Builds a styled Excel workbook from column definitions + row data and
 * writes it directly to the given HTTP response as a download.
 *
 * @param {Object} params
 * @param {import('express').Response} params.res
 * @param {string} params.fileName - without extension
 * @param {string} params.sheetTitle
 * @param {{ header: string, key: string, width?: number }[]} params.columns
 * @param {Object[]} params.rows
 */
const exportToExcel = async ({ res, fileName = 'report', sheetTitle, columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ISHAS Organization Management System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetTitle || 'Report');

  // কলাম সেটআপ
  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width || 22,
  }));

  // হেডার রো-এর স্টাইল (Header Styling)
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 26;

  // ডাটা রো যুক্ত করা
  sheet.addRows(rows);

  // প্রতিটি সেলে বর্ডার, এলাইনমেন্ট এবং জেব্রা-স্ট্রাইপ ব্যাকগ্রাউন্ড দেওয়া
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // হেডার স্কিপ করার জন্য

    row.height = 20;
    row.eachCell({ includeEmpty: true }, (cell) => {
      // সাধারণ ফন্ট
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };

      // হালকা বর্ডার
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };

      // অল্টারনেট রো কালার (Zebra Striping)
      if (rowNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }
    });
  });

  // ফাইলনেমে বাংলা ক্যারেক্টার সেফ করার ব্যবস্থা (UTF-8 encoding)
  const encodedFileName = encodeURIComponent(fileName);

  // HTTP Headers সেট করা
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodedFileName}.xlsx"; filename*=UTF-8''${encodedFileName}.xlsx`
  );
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // ফাইল স্ট্রিম করে রেসপন্সে পাঠিয়ে দেওয়া
  await workbook.xlsx.write(res);
};

module.exports = exportToExcel;