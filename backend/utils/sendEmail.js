const brevo = require("@getbrevo/brevo");
const env = require("../config/env");
const logger = require("./logger");

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  env.brevo.apiKey
);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const email = new brevo.SendSmtpEmail();

    email.sender = {
      name: env.email.fromName,
      email: env.email.fromAddress,
    };

    email.to = [{ email: to }];

    email.subject = subject;
    email.htmlContent = html;

    const response = await apiInstance.sendTransacEmail(email);

    logger.info(`Email sent successfully -> ${to}`);
    return response;

  } catch (err) {
    console.error(err);

    logger.error(
      `Email sending failed -> ${to}: ${err.message}`
    );

    throw err;
  }
};

module.exports = sendEmail;