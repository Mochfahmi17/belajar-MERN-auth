import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AppContext from "../context/AppContext";

const EmailVerify = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContext);

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp },
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
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

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
    if (!isLoggedin) {
      navigate("/");
    }
  }, [isLoggedin, userData, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400 px-6 sm:px-0">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 top-5 w-28 cursor-pointer sm:left-20 sm:w-32"
      />
      <form
        onSubmit={(e) => onSubmitHandler(e)}
        className="w-96 rounded-lg bg-slate-900 p-8 text-sm shadow-lg"
      >
        <h1 className="mb-4 text-center text-2xl font-semibold text-white">
          Email verify OTP
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
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 py-3 text-white"
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
