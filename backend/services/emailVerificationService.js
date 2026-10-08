const crypto = require("crypto");

const EmailVerificationOTP =
  require(
    "../models/EmailVerificationOTP"
  );

const User =
  require("../models/User");

const {
  sendTwoFactorOTP,
} = require("./emailService");

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const VERIFICATION_EXPIRY_MINUTES = 10;

const VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

const MAX_VERIFICATION_ATTEMPTS = 5;

// --------------------------------------------------
// GENERATE OTP
// --------------------------------------------------

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

// --------------------------------------------------
// HASH OTP
// --------------------------------------------------

const hashOTP = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// --------------------------------------------------
// GENERATE VERIFICATION ID
// --------------------------------------------------

const generateVerificationId = () => {
  return crypto.randomUUID();
};

// --------------------------------------------------
// SEND VERIFICATION OTP
// --------------------------------------------------

const createAndSendEmailVerification =
  async ({ user }) => {
    // Remove previous verification challenges
    await EmailVerificationOTP.deleteMany({
      user: user._id,
    });

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    const verificationId =
      generateVerificationId();

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() +
        VERIFICATION_EXPIRY_MINUTES *
          60 *
          1000
    );

    await EmailVerificationOTP.create({
      user: user._id,
      verificationId,
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    });

    try {
      await sendTwoFactorOTP({
        email: user.email,
        name: user.name,
        otp,
      });
    } catch (error) {
      console.error(
        "EMAIL VERIFICATION SEND ERROR:",
        {
          message: error.message,
          code: error.code,
          responseCode:
            error.responseCode,
          response: error.response,
          command: error.command,
        }
      );

      await EmailVerificationOTP.deleteOne({
        verificationId,
      });

      throw new Error(
        "Unable to send email verification code. Please try again."
      );
    }

    return {
      verificationId,
      expiresAt,
      cooldownSeconds:
        VERIFICATION_RESEND_COOLDOWN_SECONDS,
    };
  };

// --------------------------------------------------
// VERIFY EMAIL OTP
// --------------------------------------------------

const verifyEmailVerificationOTP =
  async ({
    verificationId,
    otp,
  }) => {
    if (!verificationId) {
      throw new Error(
        "Email verification session is required"
      );
    }

    if (!otp) {
      throw new Error(
        "Verification code is required"
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new Error(
        "Verification code must be 6 digits"
      );
    }

    const challenge =
      await EmailVerificationOTP.findOne({
        verificationId,
      });

    if (!challenge) {
      throw new Error(
        "Verification code is invalid or expired"
      );
    }

    // ------------------------------------------------
    // CHECK EXPIRATION
    // ------------------------------------------------

    if (
      challenge.expiresAt.getTime() <=
      Date.now()
    ) {
      await EmailVerificationOTP.deleteOne({
        _id: challenge._id,
      });

      throw new Error(
        "Verification code has expired"
      );
    }

    // ------------------------------------------------
    // CHECK ATTEMPTS
    // ------------------------------------------------

    if (
      challenge.attempts >=
      MAX_VERIFICATION_ATTEMPTS
    ) {
      await EmailVerificationOTP.deleteOne({
        _id: challenge._id,
      });

      throw new Error(
        "Too many verification attempts. Please request a new code."
      );
    }

    // ------------------------------------------------
    // VERIFY OTP
    // ------------------------------------------------

    const submittedHash =
      hashOTP(otp);

    const isValid =
      submittedHash ===
      challenge.otpHash;

    if (!isValid) {
      challenge.attempts += 1;

      await challenge.save();

      const remainingAttempts =
        MAX_VERIFICATION_ATTEMPTS -
        challenge.attempts;

      if (remainingAttempts <= 0) {
        await EmailVerificationOTP.deleteOne({
          _id: challenge._id,
        });

        throw new Error(
          "Too many verification attempts. Please request a new code."
        );
      }

      throw new Error(
        `Invalid verification code. ${remainingAttempts} attempt${
          remainingAttempts === 1
            ? ""
            : "s"
        } remaining.`
      );
    }

    // ------------------------------------------------
    // MARK EMAIL AS VERIFIED
    // ------------------------------------------------

    const user =
      await User.findById(
        challenge.user
      );

    if (!user) {
      await EmailVerificationOTP.deleteOne({
        _id: challenge._id,
      });

      throw new Error(
        "User account could not be found"
      );
    }

    user.emailVerified = true;
    user.emailVerifiedAt =
      new Date();

    await user.save();

    // OTP is single-use
    await EmailVerificationOTP.deleteOne({
      _id: challenge._id,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status:
          user.status || "active",
        emailVerified:
          user.emailVerified,
        emailVerifiedAt:
          user.emailVerifiedAt,
      },
    };
  };

// --------------------------------------------------
// RESEND VERIFICATION OTP
// --------------------------------------------------

const resendEmailVerification =
  async ({
    verificationId,
  }) => {
    if (!verificationId) {
      throw new Error(
        "Email verification session is required"
      );
    }

    const challenge =
      await EmailVerificationOTP.findOne({
        verificationId,
      }).populate("user");

    if (!challenge) {
      throw new Error(
        "Email verification session is invalid or expired"
      );
    }

    const user = challenge.user;

    if (!user) {
      await EmailVerificationOTP.deleteOne({
        _id: challenge._id,
      });

      throw new Error(
        "User account could not be found"
      );
    }

    if (user.emailVerified) {
      await EmailVerificationOTP.deleteOne({
        _id: challenge._id,
      });

      throw new Error(
        "Email address is already verified"
      );
    }

    // ------------------------------------------------
    // RESEND COOLDOWN
    // ------------------------------------------------

    const elapsedSeconds =
      Math.floor(
        (Date.now() -
          challenge.lastSentAt.getTime()) /
          1000
      );

    if (
      elapsedSeconds <
      VERIFICATION_RESEND_COOLDOWN_SECONDS
    ) {
      const remaining =
        VERIFICATION_RESEND_COOLDOWN_SECONDS -
        elapsedSeconds;

      throw new Error(
        `Please wait ${remaining} seconds before requesting another code`
      );
    }

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() +
        VERIFICATION_EXPIRY_MINUTES *
          60 *
          1000
    );

    challenge.otpHash = otpHash;
    challenge.expiresAt = expiresAt;
    challenge.attempts = 0;
    challenge.lastSentAt = now;

    await challenge.save();

    try {
      await sendTwoFactorOTP({
        email: user.email,
        name: user.name,
        otp,
      });
    } catch (error) {
      console.error(
        "EMAIL VERIFICATION RESEND ERROR:",
        {
          message: error.message,
          code: error.code,
          responseCode:
            error.responseCode,
          response: error.response,
          command: error.command,
        }
      );

      throw new Error(
        "Unable to resend email verification code. Please try again."
      );
    }

    return {
      verificationId,
      expiresAt,
      cooldownSeconds:
        VERIFICATION_RESEND_COOLDOWN_SECONDS,
    };
  };

module.exports = {
  createAndSendEmailVerification,
  verifyEmailVerificationOTP,
  resendEmailVerification,
};