const nodemailer = require("nodemailer");

// --------------------------------------------------
// SMTP CONFIG DEBUG
// --------------------------------------------------

console.log("SMTP CONFIG:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,

  // NEVER print SMTP_PASSWORD
  passwordExists:
    !!process.env.SMTP_PASSWORD,

  from: process.env.SMTP_FROM,
});

// --------------------------------------------------
// SMTP TRANSPORTER
// --------------------------------------------------

const smtpPort = Number(
  process.env.SMTP_PORT || 587
);

const smtpSecure =
  String(
    process.env.SMTP_SECURE
  ).toLowerCase() === "true";

const transporter =
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// --------------------------------------------------
// VERIFY SMTP CONFIGURATION
// --------------------------------------------------

const verifyEmailTransport =
  async () => {
    try {
      await transporter.verify();

      console.log(
        "SMTP email transport is ready"
      );
    } catch (error) {
      console.error(
        "SMTP configuration error:",
        {
          message: error.message,
          code: error.code,
          responseCode:
            error.responseCode,
          response: error.response,
          command: error.command,
        }
      );
    }
  };

// --------------------------------------------------
// SEND 2FA OTP
// --------------------------------------------------

const sendTwoFactorOTP = async ({
  email,
  name,
  otp,
}) => {
  const mailOptions = {
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      "Your InventoryFlow verification code",

    text: `Hello ${name},

Your InventoryFlow verification code is:

${otp}

This code will expire in 5 minutes.

If you did not attempt to sign in, please contact your administrator.

Regards,
InventoryFlow Security`,
  };

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "2FA OTP EMAIL SENT:",
      {
        messageId:
          info.messageId,

        accepted:
          info.accepted,

        rejected:
          info.rejected,

        response:
          info.response,
      }
    );

    return info;
  } catch (error) {
    // ----------------------------------------------
    // IMPORTANT:
    // Do NOT log:
    // - SMTP password
    // - OTP
    // ----------------------------------------------

    console.error(
      "SMTP SEND ERROR:",
      {
        message: error.message,
        code: error.code,
        responseCode:
          error.responseCode,
        response:
          error.response,
        command:
          error.command,
        rejected:
          error.rejected,
        rejectedErrors:
          error.rejectedErrors,
      }
    );

    throw error;
  }
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  sendTwoFactorOTP,
  verifyEmailTransport,
};