import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import {
  verifyEmail,
  resendEmailVerification,
} from "../../services/authService";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    verificationId: initialVerificationId,
    email,
    name,
    cooldownSeconds: initialCooldown = 60,
  } = location.state || {};

  const [verificationId, setVerificationId] = useState(
    initialVerificationId || ""
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cooldown, setCooldown] = useState(initialCooldown);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
        setCooldown((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
    }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!verificationId) {
      setError("Verification session is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      await verifyEmail({
        verificationId,
        otp,
      });

      setSuccess("Email verified successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/auth/login", {
          state: {
            email,
            verified: true,
          },
        });
      }, 1200);
    } catch (error) {
      setError(
        error.message ||
          "Unable to verify your email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verificationId || cooldown > 0 || resending) {
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await resendEmailVerification({
        verificationId,
      });

      if (response.verificationId) {
        setVerificationId(response.verificationId);
      }

      setCooldown(response.cooldownSeconds || 60);
      setSuccess("A new verification code has been sent.");
    } catch (error) {
      setError(
        error.message ||
          "Unable to resend the verification code."
      );
    } finally {
      setResending(false);
    }
  };

  if (!verificationId || !email) {
    return (
      <AuthLayout>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-5">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <Mail className="mx-auto text-blue-600" size={32} />

            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Verification session not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please create your account again to receive a new
              verification code.
            </p>

            <Link
              to="/auth/signup"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Sign Up
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Mail size={23} />
              </div>

              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Verify your email
              </h1>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                Hi {name || "there"}, we've sent a 6-digit verification
                code to
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {email}
              </p>
            </div>

            <form onSubmit={handleVerify} className="mt-6">
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="Enter 6-digit code"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <p className="text-xs font-medium text-green-600">
                    {success}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify Email
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500">
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <RefreshCw size={13} />

                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend verification code"}
              </button>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <Link
                to="/auth/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Back to Login
              </Link>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 size={13} />
            Your account information is securely handled.
          </div>
        </div>
      </section>
    </AuthLayout>
  );
};

export default VerifyEmailPage;