const { Resend } = require("resend");
const env = require("../config/env");
const logger = require("./logger");

const resend = new Resend(env.resend.apiKey);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${env.smtp.fromName} <${env.smtp.fromAddress}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    logger.info(`Email sent successfully -> ${to}`);

    return data;
  } catch (err) {
    console.error(err);

    logger.error(`Email sending failed -> ${to}: ${err.message}`);

    throw err;
  }
};

module.exports = sendEmail;