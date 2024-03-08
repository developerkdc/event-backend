import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// const GuestSchema = new mongoose.Schema({
//   first_name: { type: String, minlength: 2, maxlength: 25, required: [true, "First name is required."], trim: true },
//   last_name: { type: String, minlength: 2, maxlength: 25, required: [true, "Last name is required."], trim: true },
//   dob: { type: Date, default: null },
//   email_id: {
//     type: String,
//     minlength: 5,
//     maxlength: 50,
//     // required: [true, "Email ID Required"],
//     trim: true,
//     default: null,
//   },
//   mobile_no: { type: String, minlength: 10, maxlength: 10, trim: true, default: null },
//   relation: { type: String, trim: true, required: [true, "Relation with member is required."], trim: true },
// });

const GuestSchema = new mongoose.Schema({
  // guest_id: {
  //   type: Number,
  //   required: [true, "Member ID required."],
  //   indexedDB: true,
  //   trim: true,
  //   unique: [true, "Member ID already exist."],
  // },
  // member_type: { type: String, required: [true, "Member type is required."], indexedDB: true, trim: true },
  first_name: { type: String, required: [true, "First name is required."], trim: true },
  last_name: { type: String, required: [true, "Last name is required."], trim: true },
  dob: { type: Date, default: null },
  gender: { type: String,required: [true, "Gender is required."], default: null },
  email_id: {
    type: String,
    trim: true,
  },
  password: { type: String, trim: true },
  mobile_no: { type: String, trim: true, default: null },
  status: { type: String, default: "Registered" },
  otp: { type: String, trim: true, default: null },
  blood_group: { type: String, trim: true, default: null },
  relation: { type: String, trim: true, default: null },
  register_by_name: { type: String, trim: true, default: "Self" },
  register_by_id: { type: mongoose.Schema.Types.ObjectId, ref: "event-guest", default: null },
  refer_by_name: { type: String, trim: true, default: null },
  refer_by_id: { type: mongoose.Schema.Types.ObjectId, ref: "event-guest",default:null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

GuestSchema.methods.jwtToken = function (next) {
  try {
    return jwt.sign({ id: this._id, emailId: this.email_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  } catch (error) {
    return next(error);
  }
};

const guestModel = mongoose.model("event-guest", GuestSchema);
export default guestModel;
