import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
} from "lucide-react";

const TwoFactorVerification = ({
  email,
  expiresAt,
  cooldownSeconds = 60,
  loading = false,
  error = "",
  onVerify,
  onResend,
  onBack,
}) => {
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] =
    useState(cooldownSeconds);

  const [remainingSeconds, setRemainingSeconds] =
    useState(() => {
      if (!expiresAt) {
        return 5 * 60;
      }

      const remaining = Math.ceil(
        (new Date(expiresAt).getTime() - Date.now()) /
          1000
      );

      return Math.max(0, remaining);
    });

  // --------------------------------------------------
  // OTP EXPIRY COUNTDOWN
  // --------------------------------------------------

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil(
        (new Date(expiresAt).getTime() - Date.now()) /
          1000
      );

      setRemainingSeconds(
        Math.max(0, remaining)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // --------------------------------------------------
  // RESEND COUNTDOWN
  // --------------------------------------------------

  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setResendCountdown((prev) =>
        Math.max(0, prev - 1)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCountdown]);

  // --------------------------------------------------
  // FORMAT TIME
  // --------------------------------------------------

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${minutes}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // HANDLE OTP INPUT
  // --------------------------------------------------

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  // --------------------------------------------------
  // VERIFY
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      return;
    }

    await onVerify(otp);
  };

  // --------------------------------------------------
  // RESEND
  // --------------------------------------------------

  const handleResend = async () => {
    if (resendCountdown > 0 || loading) {
      return;
    }

    const result = await onResend();

    if (result?.cooldownSeconds) {
      setResendCountdown(
        result.cooldownSeconds
      );
    }
  };

  const otpExpired =
    remainingSeconds <= 0;

  return (
    <div>
      {/* Icon */}
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <ShieldCheck size={21} />
      </div>

      {/* Heading */}
      <div className="mt-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Verify your identity
        </h1>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Enter the 6-digit verification code
          sent to your email.
        </p>
      </div>

      {/* Email */}
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Mail
            size={14}
            className="shrink-0 text-blue-600"
          />

          <p className="min-w-0 truncate text-[11px] font-medium text-slate-700">
            {email}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5"
      >
        {/* OTP */}
        <div>
          <label
            htmlFor="otp"
            className="mb-1.5 block text-xs font-medium text-slate-700"
          >
            Verification Code
          </label>

          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            maxLength={6}
            autoFocus
            disabled={loading || otpExpired}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.45em] text-slate-900 outline-none transition placeholder:text-slate-300 placeholder:tracking-[0.45em] hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        {/* Expiry */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px]">
          <Clock3
            size={12}
            className={
              otpExpired
                ? "text-red-500"
                : "text-slate-400"
            }
          />

          {otpExpired ? (
            <span className="font-medium text-red-500">
              This verification code has expired.
            </span>
          ) : (
            <span className="text-slate-500">
              Code expires in{" "}
              <span className="font-semibold text-slate-700">
                {formatTime(
                  remainingSeconds
                )}
              </span>
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-[10px] font-medium leading-4 text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Verify */}
        <button
          type="submit"
          disabled={
            loading ||
            otp.length !== 6 ||
            otpExpired
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading
            ? "Verifying..."
            : "Verify & Sign In"}

          {!loading && (
            <ArrowRight size={14} />
          )}
        </button>
      </form>

      {/* Resend */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-slate-500">
          Didn't receive the code?
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={
            resendCountdown > 0 || loading
          }
          className="mt-1 text-[10px] font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {resendCountdown > 0
            ? `Resend code in ${resendCountdown}s`
            : "Resend verification code"}
        </button>
      </div>

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="mx-auto mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft size={12} />
        Back to login
      </button>

      {/* Security */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">
        <CheckCircle2 size={10} />
        Your verification is securely handled.
      </div>
    </div>
  );
};

export default TwoFactorVerification;