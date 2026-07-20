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
const exportToExcel = async ({ res, fileName, sheetTitle, columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ISHAS Organization Management System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetTitle || 'Report');

  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 20 }));

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 22;

  rows.forEach((row) => sheet.addRow(row));

  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
      if (rowNumber % 2 === 0 && rowNumber !== 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = exportToExcel;
