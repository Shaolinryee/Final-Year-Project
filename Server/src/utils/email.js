const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"CollabSpace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw if email fails in dev, just log it
    if (process.env.NODE_ENV === 'production') throw error;
    return null;
  }
};

/**
 * Professional Invitation Email Template
 */
const sendInvitationEmail = async (email, { projectName, inviterName, projectKey, token }) => {
  const acceptUrl = `${process.env.CLIENT_URL}/invitations?token=${token}`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 28px;">CollabSpace</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Modern Project Management</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-top: 0; color: #1e293b;">You've been invited!</h2>
        <p style="font-size: 16px; line-height: 1.6;"><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName} (${projectKey})</strong> on CollabSpace.</p>
        
        <div style="margin: 35px 0; text-align: center;">
          <a href="${acceptUrl}" style="background-color: #6366f1; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">Accept Invitation</a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">This invitation will expire in 7 days.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
        <p>&copy; 2026 CollabSpace. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail(email, `Invitation to join ${projectName}`, html);
};

/**
 * Professional OTP Email Template
 */
const sendOTPEmail = async (email, { otp, type = 'verification' }) => {
  const title = type === 'password_reset' ? 'Reset Your Password' : 'Verify Your Email';
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 28px;">CollabSpace</h1>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 40px; border: 1px solid #e2e8f0;">
        <h2 style="margin-top: 0; color: #1e293b; text-align: center;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.6; text-align: center;">Use the code below to complete your process. This code is valid for 10 minutes.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <div style="background-color: #ffffff; border: 2px dashed #6366f1; color: #1e293b; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
            ${otp}
          </div>
        </div>
        
        <p style="font-size: 14px; color: #ef4444; font-weight: 500; text-align: center; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail(email, `${title} - CollabSpace`, html);
};

module.exports = {
  sendEmail,
  sendInvitationEmail,
  sendOTPEmail,
  transporter,
};
