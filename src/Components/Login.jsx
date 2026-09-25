import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser } from "../APIs/api";
import { SiTicktick } from "react-icons/si";
import { MdErrorOutline } from "react-icons/md";
import { useUserStore } from "../store/userStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const newuser = useUserStore((state) => state.newuser);

  const { mutate: loginMutation, isPending: isLoading } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("userInfo", JSON.stringify(data));
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      const message = error?.response?.data || error.message;
      setErrormessage(message);
    },
  });

  const { mutate: registerMutation, isPending: isRegLoading } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1000);
      setErrormessage("");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      setErrormessage(message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newuser) {
      loginMutation({ email, password });
    } else {
      registerMutation({ email, password });
    }
  };

  return (
    <div className="w-full">
      {showToast && !errormessage && !newuser && (
        <div
          className="animate-slide-down fixed left-1/2 top-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-xl shadow-emerald-900/15"
          role="status"
        >
          <SiTicktick className="shrink-0" /> Successfully logged in!
        </div>
      )}
      {!errormessage && showToast && newuser && (
        <div
          className="animate-slide-down fixed left-1/2 top-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-xl shadow-emerald-900/15"
          role="status"
        >
          <SiTicktick className="shrink-0" /> Successfully created your account!
        </div>
      )}
      {errormessage && (
        <div
          className="animate-slide-down fixed left-1/2 top-5 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white shadow-xl shadow-red-900/15"
          role="alert"
        >
          <MdErrorOutline className="shrink-0 text-lg" />
          {errormessage}
        </div>
      )}
      <div className="w-full">
        <div className="mb-9 flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold tracking-tight text-slate-950">
              GALFAR
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Streamlined Approvals
            </p>
          </div>
        </div>

        <div>
          <h2
            className={`text-left text-[2rem] font-semibold leading-tight tracking-[-0.025em] text-slate-950 ${
              newuser ? "text-3xl" : "text-4xl"
            }`}
          >
            {newuser ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
            {newuser
              ? "Enter your details to get started."
              : "Sign in with your credentials to continue."}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@galfaremirates.com"
                className="block h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm shadow-slate-950/[0.03] transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <NavLink
                  to={`/resetpwd?email=${email}`}
                  type="button"
                  className="text-sm font-medium text-blue-700 transition hover:text-blue-800 hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
                >
                  Forgot password?
                </NavLink>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={newuser ? "new-password" : "current-password"}
                required
                placeholder="Enter your password"
                className="block h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm shadow-slate-950/[0.03] transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-slate-950/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {(isLoading || isRegLoading) && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {newuser ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-5 text-slate-500">
            {newuser
              ? "Already have an account? Sign in with your existing credentials."
              : "Need an account? Contact administrator for access."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
