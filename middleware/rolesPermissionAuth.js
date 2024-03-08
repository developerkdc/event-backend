import userModel from "../database/schema/user.schema.js";
import ApiError from "../Utils/ApiError.js"; // Make sure to provide the correct path

const rolesPermissions = (name, key) => {
  return async (req, res, next) => {
    try {
      let userId = req.user._id;
      const user = await userModel.findById(userId);
      if (!user) {
        return next(new ApiError("User Not Found.", 404));
      }

      if(!user.role_id || user.role_id.status== false || user.role_id.deleted_at !== null){
        return next(new ApiError("User role not found or disabled.", 403 ));
      }

      const isAuthorized = user.role_id.permissions[name][key];
      if (isAuthorized != true) {
        return res.status(403).json({
          success: false,
          message: "Access Denied.",
        });
      }
      next();
    } catch (error) {
      next(new ApiError("Internal Server Error.", 500));
    }
  };
};

export default rolesPermissions;
