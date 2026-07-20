const sendEmail = require('./sendEmail');
const logger = require('./logger');

/**
 * Sends the same email to many recipients in small concurrent batches
 * to avoid overwhelming the SMTP connection. Failures for individual
 * recipients are logged but do not stop the rest of the batch.
 *
 * @param {string[]} recipients - list of email addresses
 * @param {string} subject
 * @param {string} html
 * @param {number} batchSize
 */
const sendBulkEmail = async (recipients, subject, html, batchSize = 10) => {
  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((to) => sendEmail({ to, subject, html }))
    );

    results.forEach((r) => {
      if (r.status === 'fulfilled') sentCount += 1;
      else {
        failedCount += 1;
        logger.warn(`Bulk email failed for a recipient: ${r.reason?.message}`);
      }
    });
  }

  return { sentCount, failedCount, total: recipients.length };
};

module.exports = sendBulkEmail;
