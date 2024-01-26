const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

const sendResetPasswordEmail = async (email, resetToken) => {
    try {
        // Create the email message
        const message = {
            From: process.env.EMAIL_FROM, // Replace with your email
            To: email,
            Subject: 'Reset Password',
            HtmlBody: `
                <p>You have requested to reset your password.</p>
                <p>Click the following link to reset your password:</p>
                <a href="${process.env.CLIENT_URL}/auth/reset-password/${resetToken}">Reset Password</a>
                <p>If you didn't request this, you can ignore this email.</p>
            `,
        };

        // Send the email
        const response = await client.sendEmail(message);

        console.log(`Reset password email sent successfully to ${email} with token ${resetToken}`);
        console.log(response);
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw error;
    }
};

module.exports = { sendResetPasswordEmail };