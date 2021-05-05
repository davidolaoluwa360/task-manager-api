const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = ({ email, name }) => {
  sendGrid.send({
    to: email,
    from: {
      name: 'Welcome@TaskManager',
      email: process.env.SENDGRID_MAIL_FROM,
    },
    subject: 'Thanks for joining',
    text: `Welcome to the app. ${name}. Let me know if you are getting along`,
  });
};

const sendCancelationEmail = ({ email, name }) => {
  sendGrid.send({
    to: email,
    from: {
      email: process.env.SENDGRID_MAIL_FROM,
      name: 'Sorry For Leaving',
    },
    subject: 'Sorry to see you go!',
    text: 'So Early, we regret that you leave us at this time',
  });
};

module.exports = {
  welcomeEmail: sendWelcomeEmail,
  cancelationEmail: sendCancelationEmail,
};
