import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext } from "react";
import AppContext from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp",
        { withCredentials: true },
      );

      if (data.success) {
        navigate("/email-verify");
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

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      if (confirm("Logout?")) {
        const { data } = await axios.post(backendUrl + "/api/auth/logout");
        data.success && setIsLoggedin(false);
        data.success && setUserData(false);
        toast.success(data.message);
        navigate("/");
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
    <div className="absolute top-0 flex w-full items-center justify-between p-4 sm:p-6 sm:px-24">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />
      {userData ? (
        <div className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all">
          {userData.name[0].toUpperCase()}
          <div className="absolute right-0 top-0 z-10 hidden rounded pt-10 text-black group-hover:block">
            <ul className="m-0 list-none bg-gray-100 p-2 text-sm">
              {!userData.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="cursor-pointer rounded px-2 py-1 transition-all hover:bg-gray-200"
                >
                  Verify Email
                </li>
              )}

              <li
                onClick={logout}
                className="cursor-pointer rounded px-2 py-1 pr-10 transition-all hover:bg-red-600 hover:text-white"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 rounded-full border border-gray-500 px-6 py-2 text-gray-800 transition-all hover:bg-gray-100"
        >
          Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
