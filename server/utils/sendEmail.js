const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    // For production, use SendGrid, Mailgun, or Gmail with App Password
    // For development, we can use Ethereal or just log the message if no creds

    console.log('SendEmail: Starting...');
    let transporter;

    if (process.env.SMTP_HOST) {
        console.log('SendEmail: Using SMTP Config:', process.env.SMTP_HOST);

        const transportConfig = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        };

        // Specific fix for Gmail to ensure it works smoothly
        if (process.env.SMTP_HOST === 'smtp.gmail.com') {
            transportConfig.service = 'gmail';
        }

        try {
            transporter = nodemailer.createTransport(transportConfig);
        } catch (err) {
            console.error('SendEmail: Transporter creation failed:', err);
            throw err;
        }
    } else {
        // Fallback to Ethereal for testing if no env vars
        // const testAccount = await nodemailer.createTestAccount();
        // transporter = nodemailer.createTransport({
        //     host: 'smtp.ethereal.email',
        //     port: 587,
        //     secure: false,
        //     auth: {
        //         user: testAccount.user,
        //         pass: testAccount.pass,
        //     },
        // });
        // console.log('Ethereal Email Creds:', testAccount.user, testAccount.pass);

        // Simple console log fallback for now to avoid blocking
        console.log('SMTP_HOST not set. Email would be sent to:', options.email);
        console.log('Subject:', options.subject);
        console.log('Message:', options.message);
        return;
    }

    const message = {
        from: `${process.env.FROM_NAME || 'SmartSpend'} <${process.env.FROM_EMAIL || 'noreply@smartspend.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Optional
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('SendEmail: Failed to send via SMTP:', error.message);
        console.log('--- EMAIL FALLBACK ---');
        console.log('To:', options.email);
        console.log('Subject:', options.subject);
        console.log('Message:', options.message);
        console.log('----------------------');
    }
};

module.exports = sendEmail;
