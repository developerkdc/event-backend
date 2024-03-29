import mongoose from "mongoose";
import catchAsync from "../../Utils/catchAsync.js";
import guestModel from "../../database/schema/guest.schema.js";
import bcrypt from "bcrypt";
import ApiError from "../../Utils/ApiError.js";
import generateQR from "../../Utils/QRCodeGenerater.js";
import sendEmail from "../../Utils/SendEmail.js";

export const GetGuestDetails = catchAsync(async (req, res) => {
  //   const page = parseInt(req.query.page) || 1;
  //   const limit = 10;
  //   const skip = (page - 1) * limit;

  const {
    sortField = "created_at",
    sortOrder = "desc",
    search,
    // status,
    start_date,
    end_date,
    id,
  } = req.query;

  if (id) {
    const guest = await guestModel.findById(id);

    if (!guest) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Guest not found.",
      });
    }
    const AllMember = await guestModel.find({
      $and: [{ register_by_id: id }, { _id: { $ne: id } }],
    });
    return res.status(200).json({
      status: true,
      data: {
        registerBy: guest,
        member: AllMember,
      },
      message: "Fetched successfully",
    });
  }

  // const sortField = req.query.sortField || "guest_id";
  // const sortOrder = req.query.sortOrder || "asc";
  const sort = {};
  if (sortField) sort[sortField] = sortOrder === "asc" ? 1 : -1;

  //search  functionality
  var searchQuery = { deleted_at: null };
  if (search) {
    const searchRegex = new RegExp(".*" + search + ".*", "i");
    searchQuery = {
      ...searchQuery,
      $or: [
        { first_name: searchRegex },
        { last_name: searchRegex },
        // { email_id: searchRegex },
        { mobile_no: searchRegex },
        // { status: searchRegex },
        // { register_by_name: searchRegex },
        // { blood_group: searchRegex },
      ],
    };
  }

  //   const filter = {};
  //   // if (status) filter["status"] = status;

  //   if (start_date && end_date) {
  //     let newStartDate = new Date(start_date).setHours(0, 0, 1);
  //     let newEndDate = new Date(end_date).setHours(23, 59, 59);
  //     filter["created_at"] = { $gte: newStartDate, $lte: newEndDate };
  //   } else if (start_date) {
  //     let newStartDate = new Date(start_date).setHours(0, 0, 1);
  //     filter["created_at"] = { $gte: newStartDate };
  //   } else if (end_date) {
  //     let newEndDate = new Date(end_date).setHours(23, 59, 59);
  //     filter["created_at"] = { $lte: newEndDate };
  //   }

  // Fetching users
  const guests = await guestModel.find({ ...searchQuery }).sort(sort);
  // .skip(skip)
  // .limit(limit);

  //total pages
  const totalDocuments = await guestModel.countDocuments({
    ...searchQuery,
  });
  //   const totalPages = Math.ceil(totalDocuments / limit);

  return res.status(200).json({
    status: true,
    data: guests,
    message: "Guests List.",
    totalDocuments,
    // totalPages: totalPages,
  });
});

export const AddGuest = catchAsync(async (req, res, next) => {
  const guestData = req.body;
  const saltRounds = 10;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (guestData.email_id) {
      const findByEmail = await guestModel.find({ email_id: guestData.email_id });
      if (findByEmail && findByEmail.length > 0) {
        return res.status(400).json({
          status: false,
          data: null,
          message: "Email Id already exists.",
        });
      }
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Email Id required.",
      });
    }
    if (guestData.mobile_no) {
      const findByMobile = await guestModel.find({ mobile_no: guestData.mobile_no });
      if (findByMobile && findByMobile.length > 0) {
        return res.status(400).json({
          status: false,
          data: null,
          message: "Mobile No. already exists.",
        });
      }
    } else {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Mobile No. required.",
      });
    }

    if (!guestData.password) {
      return next(new ApiError("Password is required", 404));
    }
    guestData.password = await bcrypt.hash(guestData.password, saltRounds);

    const MainGuest = await guestModel.create(
      [
        {
          ...guestData,
          status: "Registered",
          register_by_name: guestData.first_name + " " + guestData.last_name + "(Self)",
        },
      ],
      { session }
    );

    if (MainGuest) {
      var updateGuest = await guestModel.findByIdAndUpdate(
        { _id: MainGuest[0]._id },
        {
          $set: {
            register_by_id: MainGuest[0]._id,
          },
        },
        { new: true, session }
      );
    }

    if (MainGuest && guestData.member) {
      let memberArray= JSON.parse(guestData.member)
      await Promise.all(
        // guestData.member.map(async (ele) => {
          memberArray.map(async (ele) => {
          const GuestMember = await guestModel.create(
            [
              {
                ...ele,
                status: "Registered",
                register_by_name: MainGuest[0].first_name + " " + MainGuest[0].last_name,
                register_by_id: MainGuest[0]._id,
              },
            ],
            { session }
          );
        })
      );
    }

    let QR = await generateQR(`${MainGuest[0]._id}`);

    await sendEmail({
      email: guestData.email_id,
      subject: "Event Pass",
      htmlFile: "email.hbs",
      qrCode: QR,
      id: MainGuest[0]._id,
    });

    await session.commitTransaction();
    await session.endSession();

    // Send a success response
    return res.status(201).json({
      status: true,
      data: updateGuest,
      message: "Registered successfully. QR Code has been sent on email Id",
    });
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    return next(error);
  }
});

export const UpdateGuest = catchAsync(async (req, res) => {
  const guestId = req.params.id;
  const updateData = req.body;
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    return res.status(400).json({ status: false, message: "Invalid guest ID", data: null });
  }

  // if (updateData.password) {
  //   const hashedPassword = await bcrypt.hash(updateData.password, 10);
  //   updateData.password = hashedPassword;
  // }
  updateData.updated_at = Date.now();

  const user = await guestModel.findByIdAndUpdate(guestId, { $set: updateData }, { new: true, runValidators: true });
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "Guest not found.",
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    data: user,
    message: "Guest updated successfully",
  });
});