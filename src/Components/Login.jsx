import { useState } from "react";
import galfarlogo from "../assets/Images/logo-new.png";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser } from "../APIs/api";
import { SiTicktick } from "react-icons/si";
import { MdErrorOutline } from "react-icons/md";
import { toggleNewUser } from "../store/userStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const { newuser, setNewuser } = toggleNewUser();
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
    <div>
      {showToast && !errormessage && !newuser && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          <SiTicktick /> Successfully logged in!
        </div>
      )}
      {!errormessage && showToast && newuser && (
        <div className="flex justify-center  items-center gap-2 fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          <SiTicktick /> Successfully created your account!
        </div>
      )}
      {errormessage && (
        <div className="fixed top-5 left-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 transition-all duration-300 animate-slide-in">
          <MdErrorOutline />
          {errormessage}
        </div>
      )}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 h-auto">
        <div className="mb-10">
          <img
            src={galfarlogo}
            alt="Galfar Logo"
            className="h-20 w-auto object-fill"
          />
        </div>

        <div className="w-[400px] max-w-2xl bg-white p-10 rounded-2xl shadow-lg transition-all duration-300 ease-in-out">
          <h2
            className={`font-semibold text-gray-900 mb-8 text-left ${
              newuser ? "text-2xl" : "text-3xl"
            }`}
          >
            {newuser ? "Create Account" : "Sign in"}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address*"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={newuser ? "new-password" : "current-password"}
                required
                placeholder="Password*"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {newuser
                  ? "Already have an account?"
                  : "Contact Admin for new accounts!"}
              </span>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent
                         rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                {" "}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
