import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(400).json({
        message: "Not authorized. Login again!",
        error: true,
        success: false,
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.status(400).json({
        message: "Not authorized. Login again!",
        error: true,
        success: false,
      });
    }

    console.log("Middleware - req.body sebelum: ", req.body);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export default userAuth;
