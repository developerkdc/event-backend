import catchAsync from "../../Utils/catchAsync.js";
import bcrypt from "bcrypt";
import userModel from "../../database/schema/user.schema.js";
import sendEmail from "../../Utils/SendEmail.js";

const saltRounds = 10;

export const LoginUser = catchAsync(async (req, res, next) => {
  const { email_id, password } = req.body;
  // const secretKey = process.env.JWT_SECRET;
  const user = await userModel.findOne({ email_id: email_id });
  if (!user) {
    return res.status(401).json({ message: "User not found with this email Id." });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid Password.", status: false });
  }

  const token = user.jwtToken(next);

  return (
    res
      .status(200)
      .cookie("token", token)
      // .cookie("userId", user.id)
      .json({
        status: true,
        data: {
          user: user,
          token: token,
        },
        message: "Login success.",
      })
  );
});

export const SendOTP = catchAsync(async (req, res) => {
  const { email_id } = req.body;
  // let otp = Math.floor(Math.random() * 100000);
  var otp = Math.floor(100000 + Math.random() * 9000);
  const user = await userModel.findOne({ email_id: email_id });
  if (!user) {
    return res.status(401).json({ status: false, message: "User not found with this email Id." });
  }
  user.otp = otp;
  const updatedUser = await user.save();

  await sendEmail({
    email: email_id,
    subject: "OTP",
    htmlFile: "email.hbs",
    otp: otp,
  });

  return res.status(200).json({
    status: true,
    message: `OTP has been sent successfully on email.`,
  });
});

export const VerifyOTPAndUpdatePassword = catchAsync(async (req, res) => {
  const { email_id, otp, password } = req.body;

  const user = await userModel.findOne({ email_id: email_id });

  if (!user) {
    return res.status(401).json({ status: false, message: "User not found with this email Id." });
  }
  
  if (!otp || otp != user.otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  user.password = hashedPassword;
  user.otp = null;
  const updatedUser = await user.save();
  return res.status(200).json({
    status: true,
    data: updatedUser,
    message: "Password updated successfully.",
  });
});

export const GetUserDetail = catchAsync(async (req, res) => {
  var _id = req.user._id;

  var result = await userModel.findOne(_id, { password: 0, otp: 0 })
  return res.status(200).json({ data: result, message: "User Details." });
});
export const UpdateProfile = catchAsync(async (req, res) => {
  var _id = req.user._id;

  var result = await userModel.findByIdAndUpdate(
    _id,
    {
      $set: { ...req.body, updated_at: Date.now() },
    },
    { new: true, useFindAndModify: false }
  );
  return res.status(200).json({ data: result, message: "Profile has been updated." });
});
export const ResetPassword = catchAsync(async (req, res) => {
  var _id = req.user._id;

  const passwordMatch = await bcrypt.compare(req.body.old_password, req.user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Old password is incorrect.", status: false, data: null });
  }

  if (req.body.old_password == req.body.new_password) {
    return res.status(400).json({
      data: null,
      message: "This is already your current password.",
    });
  }
  const saltRounds = 10;
  const hash = await bcrypt.hash(req.body.new_password, saltRounds);
  var result = await userModel.findByIdAndUpdate(
    _id,
    {
      $set: {
        password: hash,
        updated_at: Date.now(),
      },
    },
    { new: true, useFindAndModify: false }
  );
  return res.status(200).json({ data: result, message: "Password updated successfully." });
});
