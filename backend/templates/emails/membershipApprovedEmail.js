const baseTemplate = require('./baseTemplate');

const membershipApprovedEmail = ({ name, memberId, loginUrl }) => {
  const bodyHtml = `
    <p>প্রিয় <strong>${name}</strong>,</p>
    <p>অভিনন্দন! আপনার সদস্যপদ অনুমোদন করা হয়েছে। আপনার সদস্য আইডি:</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background:#eef2ff;color:#4338ca;font-size:18px;font-weight:700;padding:12px 24px;border-radius:10px;letter-spacing:1px;">
        ${memberId}
      </span>
    </div>
    <p>এখন থেকে আপনি ড্যাশবোর্ডে লগইন করে সংগঠনের সকল কার্যক্রমে অংশগ্রহণ করতে পারবেন।</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;">
        ড্যাশবোর্ডে যান
      </a>
    </div>
  `;

  return baseTemplate({ title: 'সদস্যপদ অনুমোদিত', bodyHtml });
};

module.exports = membershipApprovedEmail;
