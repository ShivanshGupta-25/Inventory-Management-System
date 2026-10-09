import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";

const EmailVerification = ({
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
  const [cooldown, setCooldown] = useState(cooldownSeconds);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setCooldown(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setCooldown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return;
    await onVerify(otp);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setOtp("");
    } catch {
      // The parent displays the API error message.
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Mail size={22} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Verify your email</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Enter the six-digit verification code sent to{" "}
          <span className="font-semibold text-slate-700">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="email-verification-otp" className="mb-2 block text-xs font-medium text-slate-700">
          Verification code
        </label>
        <input
          id="email-verification-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit code"
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-center text-lg font-semibold tracking-[0.5em] text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {expiresAt && (
          <p className="mt-2 text-[10px] text-slate-400">
            This code expires at {new Date(expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
          </p>
        )}

        {error && (
          <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 size={15} />
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <RefreshCw size={13} />
          {resending ? "Sending code..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend verification code"}
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 flex w-full items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        Back to login
      </button>
    </div>
  );
};

export default EmailVerification;
