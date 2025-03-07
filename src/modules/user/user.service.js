import { User } from "../../db/models/user.model.js";
import cloudinary from "../../utils/cloudinary/cloudinary.js";
import { asyncHandler, compare, decrypt, encrypt, hash } from "../../utils/index.js";

export const updateUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, gender, DOB, mobileNumber } = req.body;
  const userId = req.authUser._id;


  const updatedData = { firstName, lastName, gender, DOB };


  if (mobileNumber) {
    updatedData.mobileNumber = encrypt({ data: mobileNumber });
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

  return res.json({ message: "User updated successfully", user: updatedUser });
});

export const getLoggedInUserData = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await User.findById(userId).select("-password -OTP");

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  user.mobileNumber = decrypt({ data: user.mobileNumber });

  return res.json({ message: "User data retrieved successfully", user });
});

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("firstName lastName profilePic coverPic");

  console.log("Raw User Data from DB:", user);

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const userData = user.toJSON();

  console.log("User Data After toJSON:", userData);
  delete userData._id;

  return res.json({
    message: "User profile retrieved successfully",
    "username": userData.firstName + " " + userData.lastName,
    "profilePic": userData.profilePic,
    "coverPic": userData.coverPic
  });
});

export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded!", { cause: 400 }));
  }

  const userId = req.authUser._id;
  const user = await User.findById(userId);

  if (!user) return next(new Error("User not found", { cause: 404 }));


  if (user.profilePic.public_id) {
    await cloudinary.uploader.destroy(user.profilePic.public_id);
  }


  const uploadResult = cloudinary.uploader.upload_stream(
    { folder: "profile_pictures" },
    async (error, result) => {
      if (error) return next(new Error("Cloudinary upload failed", { cause: 500 }));

      user.profilePic = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
      await user.save();

      return res.json({
        message: "Profile picture updated successfully",
        "username": user.firstName + " " + user.lastName,
        "profilePic": user.profilePic,
        "coverPic": user.coverPic
      });
    }
  ).end(req.file.buffer);
});

export const uploadCoverPic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded!", { cause: 400 }));
  }

  const userId = req.authUser._id;
  const user = await User.findById(userId);

  if (!user) return next(new Error("User not found", { cause: 404 }));


  if (user.coverPic.public_id) {
    await cloudinary.uploader.destroy(user.coverPic.public_id);
  }


  const uploadResult = cloudinary.uploader.upload_stream(
    { folder: "cover_pictures" },
    async (error, result) => {
      if (error) return next(new Error("Cloudinary upload failed", { cause: 500 }));


      user.coverPic = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
      await user.save();

      return res.json({
        message: "Cover picture updated successfully",
        "username": user.firstName + " " + user.lastName,
        "profilePic": user.profilePic,
        "coverPic": user.coverPic
      });
    }
  ).end(req.file.buffer);
});

export const deleteProfilePic = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;
  const user = await User.findById(userId);

  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (!user.profilePic.public_id) {
    return next(new Error("No profile picture found", { cause: 400 }));
  }


  await cloudinary.uploader.destroy(user.profilePic.public_id);

  user.profilePic = { secure_url: "", public_id: "" };
  await user.save();

  return res.json({
    message: "Profile picture deleted successfully",
    "username": user.firstName + " " + user.lastName,
    "profilePic": user.profilePic,
    "coverPic": user.coverPic
  });
});

export const deleteCoverPic = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;
  const user = await User.findById(userId);

  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (!user.coverPic.public_id) {
    return next(new Error("No cover picture found", { cause: 400 }));
  }


  await cloudinary.uploader.destroy(user.coverPic.public_id);


  user.coverPic = { secure_url: "", public_id: "" };
  await user.save();

  return res.json({
    message: "Cover picture deleted successfully",
    "username": user.firstName + " " + user.lastName,
    "profilePic": user.profilePic,
    "coverPic": user.coverPic
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.authUser._id;

  const user = await User.findById(userId);

  if (!user) return next(new Error("User not found", { cause: 404 }));


  if (!compare({ password: oldPassword, hashedPassword: user.password })) {
    return next(new Error("Incorrect old password", { cause: 400 }));
  }


  user.password = hash({ password: newPassword });


  user.changeCredentialTime = new Date();

  await user.save();

  return res.json({ message: "Password updated successfully" });
});

export const softDeleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.authUser._id;

  const user = await User.findById(userId);

  if (!user) return next(new Error("User not found", { cause: 404 }));

  user.deletedAt = new Date();
  await user.save();

  return res.json({ message: "Account soft deleted successfully" });
});

