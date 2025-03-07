import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as userService from "./user.service.js";
import * as userValidation from "./user.validation.js";
import { asyncHandler } from "../../utils/index.js";
import { isAuthenticate } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.put("/update", isValid(userValidation.updateUser), isAuthenticate, asyncHandler(userService.updateUser));

router.put("/update-password", isValid(userValidation.updatePassword), isAuthenticate, asyncHandler(userService.updatePassword));

router.get("/profile", isAuthenticate, asyncHandler(userService.getLoggedInUserData));

router.get("/:userId", isAuthenticate, asyncHandler(userService.getUserProfile));

router.put("/upload-profile-pic", isAuthenticate, upload.single("image"), asyncHandler(userService.uploadProfilePic));

router.put("/upload-cover-pic", isAuthenticate, upload.single("image"), asyncHandler(userService.uploadCoverPic));

router.delete("/delete-profile-pic", isAuthenticate, asyncHandler(userService.deleteProfilePic));

router.delete("/delete-cover-pic", isAuthenticate, asyncHandler(userService.deleteCoverPic));

router.delete("/soft-delete", isAuthenticate, asyncHandler(userService.softDeleteAccount));

export default router;