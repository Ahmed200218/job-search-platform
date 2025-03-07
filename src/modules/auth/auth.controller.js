import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { asyncHandler } from "../../utils/index.js";

const router = Router();

router.post("/signup", isValid(authValidation.signUp), asyncHandler(authService.signUp));
router.post("/confirm-otp", isValid(authValidation.confirmOTP), asyncHandler(authService.confirmOTP));
router.post("/signin", isValid(authValidation.signIn), asyncHandler(authService.signIn));
router.post("/signup/google", asyncHandler(authService.signUpWithGoogle));
router.post("/signin/google", asyncHandler(authService.signInWithGoogle));
router.post("/send-otp", isValid(authValidation.sendOTP), asyncHandler(authService.sendOTP));
router.post("/reset-password", isValid(authValidation.resetPassword), asyncHandler(authService.resetPassword));
router.post("/refresh-token", isValid(authValidation.refreshToken), asyncHandler(authService.refreshToken));
router.post("/cron/delete-expired-otps", asyncHandler(authService.deleteExpiredOTPs));

export default router;