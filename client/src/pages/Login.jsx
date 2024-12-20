import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "An unknow error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400 px-6 sm:px-0">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 top-5 w-28 cursor-pointer sm:left-20 sm:w-32"
      />
      <div className="w-full rounded-lg bg-slate-900 p-10 text-sm text-indigo-300 shadow-lg sm:w-96">
        <h2 className="mb-3 text-center text-3xl font-semibold text-white">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="mb-6 text-center text-sm">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex w-full items-center gap-3 rounded-full bg-[#333a5c] px-5 py-2.5">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Full Name..."
                className="w-full bg-transparent py-1 outline-none"
              />
            </div>
          )}
          <div className="mb-4 flex w-full items-center gap-3 rounded-full bg-[#333a5c] px-5 py-2.5">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Email..."
              className="w-full bg-transparent py-1 outline-none"
            />
          </div>
          <div className="mb-4 flex w-full items-center gap-3 rounded-full bg-[#333a5c] px-5 py-2.5">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password..."
              className="w-full bg-transparent py-1 outline-none"
            />
          </div>
          {state === "Sign In" && (
            <p
              onClick={() => navigate("/reset-password")}
              className="mb-4 cursor-pointer text-indigo-500"
            >
              Forgot password?
            </p>
          )}
          <button
            type="submit"
            className={`${state === "Sign Up" && "mt-4"} w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 py-2.5 font-medium text-white`}
          >
            {state}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="mt-4 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <span
              onClick={() => setState("Sign In")}
              className="cursor-pointer text-blue-400 underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="mt-4 text-center text-xs text-gray-400">
            Don&apos;s have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="cursor-pointer text-blue-400 underline"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
