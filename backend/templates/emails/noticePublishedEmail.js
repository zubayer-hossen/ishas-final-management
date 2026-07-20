const baseTemplate = require('./baseTemplate');

const noticePublishedEmail = ({ title, contentSnippet, category, noticeUrl }) => {
  const bodyHtml = `
    <p style="margin:0 0 12px;">
      <span style="display:inline-block;background:#eef2ff;color:#4338ca;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;">
        ${category}
      </span>
    </p>
    <h2 style="margin:0 0 12px;color:#111827;font-size:19px;">${title}</h2>
    <p style="color:#4b5563;">${contentSnippet}</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${noticeUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;">
        বিস্তারিত দেখুন
      </a>
    </div>
  `;

  return baseTemplate({ title: 'নতুন নোটিশ', bodyHtml });
};

module.exports = noticePublishedEmail;
