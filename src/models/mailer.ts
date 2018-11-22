import nodemailer from 'nodemailer';
import mailgun from 'nodemailer-mailgun-transport';
import moment from 'moment';

interface TemplateVars {
    visitor: string,
    user: string,
    type: string,
    date: string,
    time: string,
    reason?: string,
    before?: string,
    location?: string,
    description: string,
    email: string
}

const mailgunOptions = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    }
}

const mailer = nodemailer.createTransport(mailgun(mailgunOptions));
/*
const mailer = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'hexalxyrnovz6wk6@ethereal.email',
        pass: 'jBCaPvxe7UFeCf61VT'
    }
});
*/

export const notify = async (events: TemplateVars[], name: string, explanation: string
    , emailSubject: string, useTemplate: Function) => {
    events.forEach((event: TemplateVars) => {
        event.date = moment(event.date).format('DD.MM.YYYY');
        if (events[0].hasOwnProperty('before')) {
            event.before = events[0].before;
        }
        mailer.sendMail({
            from: process.env.DOMAIN_MAIL,
            to: event.email,
            subject: emailSubject + ' ' + event.type + ' ' + event.date
                + ' в ' + event.time,
            html: useTemplate({ ...event, user: name, reason: explanation })
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


