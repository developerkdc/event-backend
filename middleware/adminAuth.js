import jwt from "jsonwebtoken";
import ApiError from "../Utils/ApiError.js";
import userModel from "../database/schema/user.schema.js";


const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return next(new ApiError("Token not provided.", 401));
    }
    const userId = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) return next(new ApiError("Invalid token.", 400));

    const user = await userModel
      .findById({ _id: userId.id })

    if (!user) {
      return next(new ApiError("User Not Found.", 404));
    }

    if (user.status == false || user.deleted_at !== null) {
      return next(
        new ApiError(
          "Your account has been suspended. Please contact admin.",
          403
        )
      );
    }
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;