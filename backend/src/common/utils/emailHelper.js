const { sendDirectEmail } = require('../../modules/authentication/helper/email.helper');
const logger = require('../logger/winston');

const sendEmail = async ({ to, subject, html, text }) => {
  logger.info(`Dispatching email to ${to} with subject "${subject}"...`);
  return await sendDirectEmail(to, subject, html);
};

module.exports = {
  sendEmail
};
