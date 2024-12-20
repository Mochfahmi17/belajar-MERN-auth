import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useRef, useState } from "react";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState("");
  const [otp, setOtp] = useState(0);
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  axios.defaults.withCredentials = true;

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      // console.log("ini adalah index: ", index);
      // console.log("ini adalah e:", e);

      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    console.log(e);
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    try {
      e.preventDefault();

      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        {
          email,
        },
      );
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
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

  const onSubmitOTP = async (e) => {
    try {
      e.preventDefault();

      const otpArray = inputRefs.current.map((e) => e.value);
      setOtp(otpArray.join(""));
      setIsOtpSubmited(true);
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

  const onSubmitNewPassword = async (e) => {
    try {
      e.preventDefault();

      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword },
      );

      if (data.success) {
        navigate("/login");
        toast.success(data.message);
      } else {
        toast.error(data.message);
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

      {!isEmailSent && (
        // Enter email
        <form
          onSubmit={(e) => onSubmitEmail(e)}
          className="w-96 rounded-lg bg-slate-900 p-8 text-sm shadow-lg"
        >
          <h1 className="mb-4 text-center text-2xl font-semibold text-white">
            Reset Password
          </h1>
          <p className="mb-6 text-center text-indigo-300">
            Enter your registered email address.
          </p>
          <div className="mb-4 flex w-full items-center gap-3 rounded-full bg-[#333a5c] px-5 py-2.5">
            <img src={assets.mail_icon} alt="" className="h-3 w-3" />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-3 w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 py-2.5 text-white"
          >
            Submit
          </button>
        </form>
      )}

      {!isOtpSubmited && isEmailSent && (
        // OTP input form
        <form
          onSubmit={(e) => onSubmitOTP(e)}
          className="w-96 rounded-lg bg-slate-900 p-8 text-sm shadow-lg"
        >
          <h1 className="mb-4 text-center text-2xl font-semibold text-white">
            Reset Password OTP
          </h1>
          <p className="mb-6 text-center text-indigo-300">
            Enter the 6-digit code sent to your email.
          </p>
          <div
            className="mb-8 flex justify-between"
            onPaste={(e) => handlePaste(e)}
          >
            {Array(6)
              .fill(0)
              .map((_, i) => {
                return (
                  <input
                    type="text"
                    maxLength="1"
                    key={i}
                    ref={(e) => (inputRefs.current[i] = e)}
                    onInput={(e) => handleInput(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    required
                    className="h-12 w-12 rounded-md bg-[#333a5c] text-center text-xl text-white"
                  />
                );
              })}
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 py-2.5 text-white"
          >
            Submit
          </button>
        </form>
      )}

      {isOtpSubmited && isEmailSent && (
        // Enter new password
        <form
          onSubmit={(e) => onSubmitNewPassword(e)}
          className="w-96 rounded-lg bg-slate-900 p-8 text-sm shadow-lg"
        >
          <h1 className="mb-4 text-center text-2xl font-semibold text-white">
            New Password
          </h1>
          <p className="mb-6 text-center text-indigo-300">
            Enter the new password.
          </p>
          <div className="mb-4 flex w-full items-center gap-3 rounded-full bg-[#333a5c] px-5 py-2.5">
            <img src={assets.lock_icon} alt="" className="h-3 w-3" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent text-white outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-3 w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 py-2.5 text-white"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
