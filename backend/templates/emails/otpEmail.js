const baseTemplate = require('./baseTemplate');

const otpEmail = ({ name, otp, minutes }) => {
  const bodyHtml = `
    <p>প্রিয় <strong>${name}</strong>,</p>
    <p>আপনার একাউন্ট ভেরিফিকেশনের জন্য নিচের OTP কোডটি ব্যবহার করুন:</p>
    <div style="text-align:center;margin:28px 0;">
      <span style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:28px;letter-spacing:8px;font-weight:700;padding:16px 28px;border-radius:12px;">
        ${otp}
      </span>
    </div>
    <p>এই কোডটি <strong>${minutes} মিনিট</strong> পর্যন্ত কার্যকর থাকবে। নিরাপত্তার স্বার্থে এই কোড কারো সাথে শেয়ার করবেন না।</p>
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">যদি আপনি এই অনুরোধটি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
  `;

  return baseTemplate({ title: 'ইমেইল ভেরিফিকেশন', bodyHtml });
};

module.exports = otpEmail;
