const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

// Function to send reset password email
exports.sendResetPasswordEmail = async (email, resetToken) => {
    const emailData = {
        From: process.env.EMAIL_FROM,
        To: email,
        Subject: 'Reset Password Link',
        HtmlBody: `
            <h1>Please use the following link to reset your password.</h1>
            <p>${process.env.CLIENT_URL}/reset-password?token=${resetToken}</p>
            <hr/>
            <p>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `,
    };

    await client.sendEmail(emailData);
};


// exports.sendActivationEmail = async (user, email, activationToken) => {

//   const emailData = {
//     From: process.env.EMAIL_FROM,
//     To: email,
//     Subject: "Account Activation Link",
//     HtmlBody: `
//             <h1>Welcome to the TCN Lekki Information Portal</h1>
//             <p>Hi ${user.firstName},<br>I am pleased to welcome you to the TCN Lekki Information Portal. It's a platform we have carefully designed to enhance your experience as a member of the Lekki campus of The Covenant Nation.
//             Kindly click on the link below to activate your account and complete your sign up process within 24 hours.<br>
//             <a href="${process.env.CLIENT_URL}/auth/activate/${activationToken}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
//             Activate Your Account
//               </a>            
              
//               Joining the TCN Lekki information Platform will give you access to regular updates and draw you into
//             an immersive church-life experience that will provide support for your spiritual growth.
//             I encourage you to take advantage of this platform by filling your correct information, verifying your
//             email where applicable and visiting this portal regularly to connect with the church community. We also
//              look forward to feedback on how we can improve church life at TCN Lekki.<br> Once again, welcome aboard.<br>
//              Grace is multiplied in your favor!<br>
//              Best regards,<br>
//              Pastor Tayo Osiyemi </p>
            
//             <hr/>
//             <p>This email may contain sensitive information</p>
//             <p>${process.env.CLIENT_URL}</p>
//         `,
//   };


//   await client.sendEmail(emailData);
// }



exports.sendActivationEmail = async (user, email, activationToken) => {
    const emailData = {
      From: process.env.EMAIL_FROM,
      To: email,
      Subject: "Account Activation Link",
      HtmlBody: `
        <html>
          <head>
            <style>
              .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffffff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 5px;
              }
              .footer {
                font-size: 14px;
                color: #666666;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>Welcome to the TCN Lekki Information Portal</h1>
            <p>Hi ${user.firstName},</p>
            <p>
              We are pleased to welcome you to the TCN Lekki Information Portal. This platform has been carefully designed to enhance your experience as a member of the Lekki campus of The Covenant Nation.
            </p>
            <p>
              Please click the link below to activate your account and complete your sign-up process within 24 hours:
            </p>
            <p>
              <a href="${process.env.CLIENT_URL}/auth/activate/${activationToken}" class="button">Activate Your Account</a>
            </p>
            <p>
              By joining the TCN Lekki Information Portal, you will gain access to regular updates and immerse yourself in a supportive church community that fosters your spiritual growth. We encourage you to fill in your correct information, verify your email, and visit the portal regularly to connect with the church community. We also welcome your feedback on how we can improve church life at TCN Lekki.
            </p>
            <p>
              Once again, welcome aboard. Grace is multiplied in your favor!
            </p>
            <p>
              Best regards,<br>
              Pastor Tayo Osiyemi
            </p>
            <hr/>
            <p class="footer">
              This email may contain sensitive information.<br>
              ${process.env.CLIENT_URL}
            </p>
          </body>
        </html>
      `,
    };
  
    await client.sendEmail(emailData);
  };
  

// const sendResetPasswordEmail = async (email, resetToken) => {
//     try {
//         // Create the email message
//         const message = {
//             From: process.env.EMAIL_FROM, // Replace with your email
//             To: email,
//             Subject: 'Reset Password',
//             HtmlBody: `
//                 <p>You have requested to reset your password.</p>
//                 <p>Click the following link to reset your password:</p>
//                 <a href="${process.env.CLIENT_URL}/auth/reset-password/${resetToken}">Reset Password</a>
//                 <p>If you didn't request this, you can ignore this email.</p>
//             `,
//         };

//         // Send the email
//         const response = await client.sendEmail(message);

//         console.log(`Reset password email sent successfully to ${email} with token ${resetToken}`);
//         console.log(response);
//     } catch (error) {
//         console.error('Error sending reset password email:', error);
//         throw error;
//     }
// };

// module.exports = { sendResetPasswordEmail };