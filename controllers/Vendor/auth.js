import catchAsync from "../../Utils/catchAsync.js";
import bcrypt from "bcrypt";
import sendEmail from "../../Utils/SendEmail.js";
import memberModel from "../../database/schema/guest.schema.js";
import ApiError from "../../Utils/ApiError.js";

const saltRounds = 10;

export const LoginMember = catchAsync(async (req, res, next) => {
  const { member_id, password } = req.body;
  // const secretKey = process.env.JWT_SECRET;
  const member = await memberModel.findOne({ member_id: member_id });
  if (!member) {
    return res.status(401).json({ message: "Member not found with this member Id." });
  }
  const passwordMatch = await bcrypt.compare(password, member.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid Password.", status: false });
  }

  const token = member.jwtToken(next);

  return res
    .status(200)
    .cookie("token", token)
    .cookie("memberId", member.id)
    .json({
      status: true,
      data: {
        member: member,
        token: token,
      },
      message: "Login success.",
    });
});

export const SendOTP = catchAsync(async (req, res) => {
  const { member_id } = req.body;
  // let otp = Math.floor(Math.random() * 100000);
  var otp = Math.floor(100000 + Math.random() * 9000);
  const member = await memberModel.findOne({ member_id: member_id });
  if (!member) {
    return res.status(401).json({ message: "Member not found with this member Id." });
  }

  member.otp = otp;
  const updatedUser = await member.save();

  await sendEmail({
    email: member.email_id,
    subject: "OTP",
    htmlFile: "email.hbs",
    otp: otp,
  });

  return res.status(200).json({
    success: true,
    message: "OTP has been sent successfully on registered email.",
  });
});

export const VerifyOTPAndUpdatePassword = catchAsync(async (req, res) => {
  const { member_id, otp, password } = req.body;

  const member = await memberModel.findOne({ member_id: member_id });
  if (!member) {
    return res.status(401).json({ message: "Member not found with this email Id." });
  }
  console.log(member);
  if (!otp || otp !== member.otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  member.password = hashedPassword;
  member.otp = null;
  const updatedUser = await member.save();
  return res.status(200).json({
    status: true,
    data: updatedUser,
    message: "Password updated successfully.",
  });
});

export const UpdateProfile = catchAsync(async (req, res, next) => {
  var _id = req.member._id;

  if (req?.body?.member_id) {
    return next(new ApiError("Can't update Member Id", 404));
  }

  var result = await memberModel.findByIdAndUpdate(
    _id,
    {
      $set: { ...req.body, updated_at: Date.now() },
    },
    { new: true, useFindAndModify: false }
  );
  return res.status(200).json({ data: result, message: "Profile has been updated." });
});
export const ResetPassword = catchAsync(async (req, res) => {
  var _id = req.member._id;

  const { old_password, new_password } = req.body;

  const oldPasswordMatch = await bcrypt.compare(old_password, req?.member?.password);
  if (!oldPasswordMatch) {
    return res.status(401).json({ message: "Current password is incorrect.", status: false });
  }

  if (req.body.old_password == req.body.new_password) {
    return res.status(400).json({
      data: null,
      message: "This is already your current password.",
    });
  }
  const hash = await bcrypt.hash(new_password, saltRounds);
  var result = await memberModel.findByIdAndUpdate(
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
