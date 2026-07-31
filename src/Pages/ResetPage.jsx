import {
  ResetEmail,
  validateemail,
  VerifyResetToken,
  ResetUserPassword,
} from "../APIs/api";
import { useEffect, useState } from "react";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import { MdOutlineError } from "react-icons/md";
import { SiTicktick } from "react-icons/si";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPage = () => {
  const [searchParams] = useSearchParams();
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();

  const [changepassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasMinLength = newPassword.length >= 6;

  const useremail = searchParams.get("email");

  const token = searchParams.get("token");
  const [email, setEmail] = useState(useremail || "");
  const [emailsent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const user = await VerifyResetToken(token);
        if (user) {
          setChangePassword(true);
        }
      } catch (error) {
        let message = error?.response?.data.message;
        setErrorMessage(message ? message : error.message);
        setShowToast();
        setTimeout(() => {
          resetshowtoast();
          clearErrorMessage();
        }, 1500);
      }
    };
    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrorMessage();
    try {
      if (changepassword) {
        if (!newPassword) throw new Error("Please enter a new password");
        if (!hasUppercase)
          throw new Error(
            "Password must contain at least one uppercase letter",
          );
        if (!hasLowercase)
          throw new Error(
            "Password must contain at least one lowercase letter",
          );
        if (!hasDigit)
          throw new Error("Password must contain at least one digit");
        if (!hasMinLength)
          throw new Error("Password must be at least 6 characters long");
        if (newPassword !== confirmPassword)
          throw new Error("Passwords do not match");

        const res = await ResetUserPassword(token, newPassword);
        if (!res.success) {
          throw new Error("Error changing password");
        }
        setSuccessMessage("Password changed successfully!");
        setShowToast();
        setTimeout(() => {
          resetshowtoast();
          navigate("/login");
        }, 1500);
        return;
      }
      const validate = await validateemail(email);

      if (validate.email) {
        ResetEmail(email, validate.resetToken, validate.expires);

        setEmailSent(true);
        setSuccessMessage("Reset Link sent to your email Successfully!");
        setShowToast();
        setTimeout(() => {
          resetshowtoast();
        }, 1500);
      }
    } catch (error) {
      let message = error?.response?.data;
      setErrorMessage(message ? message : error.message);
      setShowToast();
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {changepassword
              ? "Set a New Password"
              : "Galfar Web App Password Reset"}
          </h1>
          {!emailsent && (
            <p className="mt-2 text-sm text-slate-600">
              {changepassword
                ? "Enter and confirm your new password to update your account."
                : "Enter your registered email address to receive password reset instructions."}
            </p>
          )}
        </div>
        {!emailsent && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!changepassword ? (
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xxxx@galfaremirates.com"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <div className="mt-3 text-sm">
                    <p className="font-semibold text-slate-800">
                      Password strength
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-1 py-1 text-xs font-medium ${hasUppercase ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${hasUppercase ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></span>
                        Uppercase
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${hasLowercase ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${hasLowercase ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></span>
                        Lowercase
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${hasDigit ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${hasDigit ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></span>
                        Digit
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${hasMinLength ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${hasMinLength ? "bg-emerald-500" : "bg-slate-300"}`}
                        ></span>
                        6+ chars
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
            >
              Submit
            </button>
          </form>
        )}

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          {!emailsent && (
            <h2 className="mb-2 font-medium text-slate-800">
              {changepassword ? "Password requirements" : "Notes :"}
            </h2>
          )}
          <ul className="list-disc space-y-1 pl-5">
            {changepassword ? (
              <ul className="list-disc space-y-1 pl-5">
                <li>Choose a strong password (min 6 characters).</li>
                <li>
                  Password should have one digit, one uppercase and one
                  lowercase letter.
                </li>
                <li>Do not share your password with anyone.</li>
                <li>After changing, use the new password to log in.</li>
              </ul>
            ) : !emailsent ? (
              <ul className="list-disc space-y-1 pl-5">
                <li>Use the email linked to your Galfar account.</li>
                <li>
                  If you do not receive the email, check your spam or junk
                  folder.
                </li>
                <li>
                  Contact your administrator if you still cannot access your
                  account.
                </li>
              </ul>
            ) : (
              <div className="">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📩</span>

                  <div>
                    <h4 className="font-semibold">Check your inbox</h4>

                    <p className="mt-1">
                      We have sent a password reset link to your registered
                      email address.
                    </p>

                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                      <li>Check your inbox and click the reset link.</li>
                      <li>
                        If you do not receive the email, check your spam or junk
                        folder.
                      </li>
                      <li>
                        Contact your administrator if you still cannot access
                        your account.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </ul>
        </div>
      </div>
      {showtoast && errormessage && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <MdOutlineError /> {errormessage}
        </div>
      )}
      {showtoast && !errormessage && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in z-[1100]">
          <SiTicktick /> {successMessage || "Operation completed successfully."}
        </div>
      )}
    </div>
  );
};

export default ResetPage;
