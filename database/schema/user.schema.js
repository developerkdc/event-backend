import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: [true, "User ID is required."],
    indexedDB: true,
    trim: true,
    unique: [true, "User ID already exist."],
  },
  first_name: { type: String, minlength: 2, maxlength: 25, required: true, trim: true },
  last_name: { type: String, minlength: 2, maxlength: 25, required: true, trim: true },
  email_id: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: [true, "Email ID Required"],
    trim: true,
    unique: [true, "Email ID already exist."],
  },
  password: { type: String, required: true, trim: true },
  mobile_no: { type: String,minlength: 10, maxlength:10, unique: [true, "Mobile Number already exist."], trim: true,default:null },
  status: { type: Boolean, default: true },
  // role_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: [true, "Role is Required"],
  //   ref: "roles",
  // },
  otp: { type: String, trim: true,default:null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

UserSchema.methods.jwtToken = function (next) {
  try {
    return jwt.sign(
      { id: this._id, userId: this.user_id, emailId: this.email_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "24hr" }
    );
  } catch (error) {
    return next(error);
  }
};

const userModel = mongoose.model("event-user", UserSchema);
export default userModel;
