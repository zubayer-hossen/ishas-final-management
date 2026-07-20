const baseTemplate = require('./baseTemplate');

const resetPasswordEmail = ({ name, resetUrl, minutes }) => {
  const bodyHtml = `
    <p>প্রিয় <strong>${name}</strong>,</p>
    <p>আপনার পাসওয়ার্ড রিসেট করার একটি অনুরোধ পাওয়া গেছে। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন:</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;">
        পাসওয়ার্ড রিসেট করুন
      </a>
    </div>
    <p>এই লিংকটি <strong>${minutes} মিনিট</strong> পর্যন্ত কার্যকর থাকবে।</p>
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">যদি আপনি এই অনুরোধটি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন — আপনার পাসওয়ার্ড অপরিবর্তিত থাকবে।</p>
  `;

  return baseTemplate({ title: 'পাসওয়ার্ড রিসেট', bodyHtml });
};

module.exports = resetPasswordEmail;
