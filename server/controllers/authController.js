import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplate.js";

//* Register/membuat user baru
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //* Cek apakah user sudah menginputkan data dan memastikan bahwa data seperti name, email dan password tidak kosong.
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing details!",
        error: true,
        success: false,
      });
    }

    //* Cek apakah email yang diinputkan user sudah ada di dalam database atau tidak
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        message: "Already registered email.",
        error: true,
        success: false,
      });
    }

    //* Proses hash password
    const genSalt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, genSalt);

    //* Proses simpan kedalam database
    const payload = {
      name,
      email,
      password: hashedPassword,
    };
    const user = new userModel(payload);
    await user.save();

    //* Membuat token dan menyimpannya di cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookiesOption);

    //* Mengirim email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome!",
      text: `Welcome to my website. your account has been created with email id: ${email}`,
    };

    await transporter.sendMail(mailOption);

    return res.json({
      message: "User register successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//* Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //* Periksa apakah user sudah menginputkan email dan password
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required!",
        error: true,
        success: false,
      });
    }

    //* cari user dari req.body.email itu ada didalam email atau tidak.
    const user = await userModel.findOne({ email });

    //* Jika user sudah memasukkan email namun email tersebut tidak ada di database, maka user belum registrasi
    if (!user) {
      return res.status(400).json({
        message: "Invalid email!",
        error: true,
        success: false,
      });
    }

    //* Memeriksa apakah password yang dimasukkan user cocok dengan password yang ada di database
    const isMatch = await bcryptjs.compare(password, user.password);

    //*Jika passwordnya tidak cocok dengan database maka block code if akan dijalankan
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password!",
        error: true,
        success: false,
      });
    }

    //* Membuat token dan menyimpannya di cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookiesOption);

    return res.json({
      message: "Login successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//* Logout
export const logout = async (req, res) => {
  try {
    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };
    res.clearCookie("token", cookiesOption);

    return res.json({
      message: "Logout successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      message: false,
    });
  }
};

//* Mengirimkan kode OTP di email user
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    //* Memeriksa apakah user sudah di verified atau belum
    if (user.isAccountVerified) {
      return res.status(400).json({
        message: "Account already verified!",
        error: true,
        success: false,
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(mailOption);

    return res.json({
      message: "Verification OTP sent on Email.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//* Melakukan verifikasi email dengan mengirimkan kode OTP
export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        message: "Missing Details",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found!",
        error: true,
        success: false,
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        message: "OTP Expired",
        error: true,
        success: false,
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({
      message: "Email verified successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//* Cek apakah user sudah login apa belum
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({
      message: "User is already aunthenticated!.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//* Mengirimkan ulang OTP
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required!",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found!",
        error: true,
        success: false,
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset OTP",
      // text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(mailOption);

    return res.json({
      message: "OTP sent to your email",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//* Reset User Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required!",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found!",
        error: true,
        success: false,
      });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP!",
        error: true,
        success: false,
      });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        message: "OTP expired!",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      message: "Password has been reset successfully!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
