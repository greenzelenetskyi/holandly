import nodemailer from 'nodemailer';
import mailgun from 'nodemailer-mailgun-transport';
import pug from 'pug';

interface TemplateVars {
    visitor: string,
    user: string,
    type: string,
    date: string,
    time: string,
    reason?: string,
    description: string
}
/*
const mailgunOptions = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    }
}

const mailer = nodemailer.createTransport(mailgun(mailgunOptions));
*/
const mailer = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'hexalxyrnovz6wk6@ethereal.email',
        pass: 'jBCaPvxe7UFeCf61VT'
    }
});


export const notify = async (events: TemplateVars[], name: string, explanation: string
    , emailSubject: string, useTemplate: Function) => {
    events.forEach((event: TemplateVars) => {
        mailer.sendMail({
            from: 'greenzelenetskyi@gmail.com',
            to: 'greenzelenetskyi@gmail.com', // An array if you have multiple recipients.
            subject: emailSubject + " " + event.type + " " + event.date + " " + event.time,
            html: useTemplate({...event, user: name, reason: explanation})
        }, function (err, info) {
            if (err) {
                console.log('Error: ' + err);
            }
            else {
                console.log('Response: ' + info);
            }
        });
    })
}


