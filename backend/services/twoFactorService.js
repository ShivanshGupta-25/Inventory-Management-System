const crypto = require("crypto");

const TwoFactorOTP = require(
  "../models/TwoFactorOTP"
);

const {
  sendTwoFactorOTP,
} = require("./emailService");

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const OTP_EXPIRY_MINUTES = 5;

const OTP_RESEND_COOLDOWN_SECONDS = 60;

const MAX_OTP_ATTEMPTS = 5;

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
// GENERATE CHALLENGE ID
// --------------------------------------------------

const generateChallengeId = () => {
  return crypto.randomUUID();
};

// --------------------------------------------------
// SEND OTP
// --------------------------------------------------

const createAndSendOTP = async ({
  user,
}) => {
  // Remove any previous active challenge
  await TwoFactorOTP.deleteMany({
    user: user._id,
  });

  const otp = generateOTP();

  const otpHash = hashOTP(otp);

  const challengeId =
    generateChallengeId();

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() +
      OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await TwoFactorOTP.create({
    user: user._id,
    challengeId,
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
    // ----------------------------------------------
    // IMPORTANT:
    // Log the actual SMTP/Resend error.
    // Never log the OTP or SMTP password.
    // ----------------------------------------------

    console.error(
      "2FA OTP EMAIL ERROR:",
      {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        response: error.response,
        command: error.command,
        rejected: error.rejected,
      }
    );

    // Do not leave an unusable challenge behind
    await TwoFactorOTP.deleteOne({
      challengeId,
    });

    throw new Error(
      "Unable to send verification code. Please try again."
    );
  }

  return {
    challengeId,
    expiresAt,
    cooldownSeconds:
      OTP_RESEND_COOLDOWN_SECONDS,
  };
};

// --------------------------------------------------
// VERIFY OTP
// --------------------------------------------------

const verifyOTP = async ({
  challengeId,
  otp,
}) => {
  if (!challengeId) {
    throw new Error(
      "Verification session is required"
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
    await TwoFactorOTP.findOne({
      challengeId,
    });

  if (!challenge) {
    throw new Error(
      "Verification code is invalid or expired"
    );
  }

  // ----------------------------------------------
  // CHECK EXPIRATION
  // ----------------------------------------------

  if (
    challenge.expiresAt.getTime() <=
    Date.now()
  ) {
    await TwoFactorOTP.deleteOne({
      _id: challenge._id,
    });

    throw new Error(
      "Verification code has expired"
    );
  }

  // ----------------------------------------------
  // CHECK MAX ATTEMPTS
  // ----------------------------------------------

  if (
    challenge.attempts >=
    MAX_OTP_ATTEMPTS
  ) {
    await TwoFactorOTP.deleteOne({
      _id: challenge._id,
    });

    throw new Error(
      "Too many verification attempts. Please request a new code."
    );
  }

  // ----------------------------------------------
  // VERIFY OTP
  // ----------------------------------------------

  const submittedHash =
    hashOTP(otp);

  const isValid =
    submittedHash ===
    challenge.otpHash;

  if (!isValid) {
    challenge.attempts += 1;

    await challenge.save();

    const remainingAttempts =
      MAX_OTP_ATTEMPTS -
      challenge.attempts;

    if (remainingAttempts <= 0) {
      await TwoFactorOTP.deleteOne({
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

  // ----------------------------------------------
  // OTP IS SINGLE USE
  // ----------------------------------------------

  const userId =
    challenge.user;

  await TwoFactorOTP.deleteOne({
    _id: challenge._id,
  });

  return {
    userId,
  };
};

// --------------------------------------------------
// RESEND OTP
// --------------------------------------------------

const resendOTP = async ({
  challengeId,
}) => {
  if (!challengeId) {
    throw new Error(
      "Verification session is required"
    );
  }

  const challenge =
    await TwoFactorOTP.findOne({
      challengeId,
    }).populate("user");

  if (!challenge) {
    throw new Error(
      "Verification session is invalid or expired"
    );
  }

  const user = challenge.user;

  if (!user) {
    await TwoFactorOTP.deleteOne({
      _id: challenge._id,
    });

    throw new Error(
      "User account could not be found"
    );
  }

  // ----------------------------------------------
  // CHECK RESEND COOLDOWN
  // ----------------------------------------------

  const elapsedSeconds =
    Math.floor(
      (Date.now() -
        challenge.lastSentAt.getTime()) /
        1000
    );

  if (
    elapsedSeconds <
    OTP_RESEND_COOLDOWN_SECONDS
  ) {
    const remaining =
      OTP_RESEND_COOLDOWN_SECONDS -
      elapsedSeconds;

    throw new Error(
      `Please wait ${remaining} seconds before requesting another code`
    );
  }

  // ----------------------------------------------
  // SAVE OLD VALUES
  // ----------------------------------------------
  // If sending the new OTP fails, restore these.

  const previousOtpHash =
    challenge.otpHash;

  const previousExpiresAt =
    challenge.expiresAt;

  const previousAttempts =
    challenge.attempts;

  const previousLastSentAt =
    challenge.lastSentAt;

  // ----------------------------------------------
  // GENERATE NEW OTP
  // ----------------------------------------------

  const otp = generateOTP();

  const otpHash = hashOTP(otp);

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() +
      OTP_EXPIRY_MINUTES * 60 * 1000
  );

  challenge.otpHash = otpHash;
  challenge.expiresAt = expiresAt;
  challenge.attempts = 0;
  challenge.lastSentAt = now;

  await challenge.save();

  // ----------------------------------------------
  // SEND NEW OTP
  // ----------------------------------------------

  try {
    await sendTwoFactorOTP({
      email: user.email,
      name: user.name,
      otp,
    });
  } catch (error) {
    console.error(
      "2FA OTP RESEND EMAIL ERROR:",
      {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        response: error.response,
        command: error.command,
        rejected: error.rejected,
      }
    );

    // Restore previous usable challenge
    challenge.otpHash =
      previousOtpHash;

    challenge.expiresAt =
      previousExpiresAt;

    challenge.attempts =
      previousAttempts;

    challenge.lastSentAt =
      previousLastSentAt;

    await challenge.save();

    throw new Error(
      "Unable to resend verification code. Please try again."
    );
  }

  return {
    challengeId,
    expiresAt,
    cooldownSeconds:
      OTP_RESEND_COOLDOWN_SECONDS,
  };
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  createAndSendOTP,
  verifyOTP,
  resendOTP,
};