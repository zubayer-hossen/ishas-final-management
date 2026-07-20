const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  return transporter;
};

/**
 * Sends an HTML email.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailer = getTransporter();

    const info = await mailer.sendMail({
      from: `"${env.smtp.fromName}" <${env.smtp.fromAddress}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent: ${info.messageId} -> ${to}`);
    return info;
  } catch (error) {
    logger.error(`Email sending failed to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
