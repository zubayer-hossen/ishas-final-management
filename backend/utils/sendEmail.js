const axios = require("axios");
const env = require("../config/env");
const logger = require("./logger");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: env.email.fromName,
          email: env.email.fromAddress,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent: html,
      },
      {
        headers: {
          "api-key": env.brevo.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        timeout: 30000,
      }
    );

    logger.info(`Email sent successfully -> ${to}`);

    return response.data;
  } catch (err) {
    console.error(
      err.response?.data || err.message
    );

    logger.error(
      `Email sending failed -> ${to}: ${
        err.response?.data?.message || err.message
      }`
    );

    throw err;
  }
};

module.exports = sendEmail;