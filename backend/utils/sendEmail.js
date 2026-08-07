const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `${env.smtp.fromName} <${env.smtp.fromAddress}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully -> ${to}`);
  } catch (err) {
    logger.error(`Email sending failed -> ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = sendEmail;