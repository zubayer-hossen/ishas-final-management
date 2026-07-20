const baseTemplate = require('./baseTemplate');

const meetingInviteEmail = ({ title, hostName, scheduledStart, joinUrl }) => {
  const bodyHtml = `
    <p>প্রিয় সদস্য,</p>
    <p>আপনাকে একটি মিটিং-এ আমন্ত্রণ জানানো হয়েছে:</p>
    <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="margin:4px 0;"><strong>বিষয়:</strong> ${title}</p>
      <p style="margin:4px 0;"><strong>আয়োজক:</strong> ${hostName}</p>
      <p style="margin:4px 0;"><strong>সময়:</strong> ${new Date(scheduledStart).toLocaleString('bn-BD')}</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${joinUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;">
        মিটিংয়ে যোগ দিন
      </a>
    </div>
    <p style="color:#6b7280;font-size:13px;">নির্ধারিত সময়ের কিছুক্ষণ আগে যোগ দেওয়ার চেষ্টা করুন।</p>
  `;

  return baseTemplate({ title: 'মিটিং আমন্ত্রণ', bodyHtml });
};

module.exports = meetingInviteEmail;
