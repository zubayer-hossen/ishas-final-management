/**
 * Wraps inner content in a professional, responsive, branded HTML shell.
 * Used by all transactional emails (OTP, verification, reset, receipts, notices).
 */
const baseTemplate = ({ title = 'ISHAS Organization', bodyHtml, footerNote = '' }) => `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:0.5px;">ISHAS Organization</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;color:#1f2937;font-size:15px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f9fafb;border-top:1px solid #eef0f3;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">${footerNote || 'এই ইমেইলটি ISHAS Organization Management System থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে।'}</p>
              <p style="margin:8px 0 0;color:#c4c8ce;font-size:11px;">© ${new Date().getFullYear()} ISHAS Organization. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = baseTemplate;
