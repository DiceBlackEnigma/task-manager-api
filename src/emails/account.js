const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

sgMail.send({
    to: 'sowemimo@systemspecs.com.ng',
    from: 'sowemimo@systemspecs.com.ng',
    subject: 'This is my first creation',
    text: 'I hope this one actually gets to you'
});

const sendWelcomeEmail = ({email, name}) => {
    sgMail.send({
        to: email,
        from: 'sowemimo@systemspecs.com.ng',
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
};

const sendCancellationEmail = ({email, name}) => {
    sgMail.send({
        to: email,
        from: 'sowemimo@systemspecs.com.ng',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}, I hope to see you back sometime soon.`
    })
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};
