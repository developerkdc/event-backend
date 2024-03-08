import jwt from "jsonwebtoken";
import ApiError from "../Utils/ApiError.js";
import memberModel from "../database/schema/guest.schema.js";


const memberAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.token;
    if (!token) {
      return next(new ApiError("Token not provided.", 401));
    }
    const memberId = jwt.verify(token, process.env.JWT_SECRET);
    if (!memberId) return next(new ApiError("Invalid token.", 400));

    const member = await memberModel
      .findById({ _id: memberId.id })

    if (!member) {
      return next(new ApiError("Member Not Found.", 404));
    }

    if (member.status == false || member.deleted_at !== null) {
      return next(
        new ApiError(
          "Your account has been suspended. Please contact admin.",
          403
        )
      );
    }
    req.member = member;
    next();
  } catch (error) {
    return next(error);
  }
};


export default memberAuthMiddleware;
