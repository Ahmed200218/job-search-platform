import { User } from "../../db/models/user.model.js";
import { asyncHandler, compare, encrypt, generateOTP, generateToken, hash, sendEmail, verify } from "../../utils/index.js";
import { messages } from "../../utils/Messages/index.js";
import cron from "node-cron";

export const signUp = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, mobileNumber, provider, DOB, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new Error("Email already exists", { cause: 400 }));

  const otpCode = generateOTP();
  const hashedOTP = hash({ password: otpCode });

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hash({ password }),
    provider,
    mobileNumber: encrypt({ data: mobileNumber }),
    DOB,
    gender,
    OTP: [{ code: hashedOTP, type: "confirmEmail", expiresIn: new Date(Date.now() + 10 * 60 * 1000) }],
  });


  await sendEmail({ to: email, subject: "Confirm Your Email", html: `Your OTP code is: ${otpCode}` });
  return res.status(201).json({ message: "OTP sent to email. Please confirm." });
});

export const confirmOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user) {
    if (user.deletedAt) {
      return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
    }
    if (user.bannedAt) {
      return next(new Error("Your account has been banned", { cause: 403 }));
    }
  }

  console.log("User OTPs from DB:", user.OTP);

  const validOTP = user.OTP.find(
    (entry) => entry.type === "confirmEmail" && entry.expiresIn > new Date()
  );

  if (!validOTP) {
    console.error(" No valid OTP found (Expired or Missing)");
    return next(new Error("OTP expired or invalid", { cause: 400 }));
  }

  console.log("Stored Hashed OTP:", validOTP.code);
  console.log("User-entered OTP (Plain):", otp);

  if (!compare({ password: otp, hashedPassword: validOTP.code })) {
    console.error(" OTP Mismatch!");
    return next(new Error("Incorrect OTP", { cause: 400 }));
  }

  user.isConfirmed = true;
  user.OTP = user.OTP.filter((entry) => entry.type !== "confirmEmail");
  await user.save();

  return res.json({ message: "Email confirmed successfully" });
});

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user.deletedAt) {
    return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
  }
  if (user.bannedAt) {
    return next(new Error("Your account has been banned", { cause: 403 }));
  }
  if (!user || !compare({ password, hashedPassword: user.password })) {
    return next(new Error("Invalid email or password", { cause: 401 }));
  }
  const accessToken = generateToken({ payload: { id: user._id }, options: { expiresIn: "1h" } });
  const refreshToken = generateToken({ payload: { id: user._id }, options: { expiresIn: "7d" } });
  return res.json({ message: "Login successful", accessToken, refreshToken });
});

export const signUpWithGoogle = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  const googleURL = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
  const response = await fetch(googleURL);
  const data = await response.json();

  let user = await User.findOne({ email: data.email });
  if (user) {
    if (user.deletedAt) {
      return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
    }
  }

  if (!data.email) {
    return next(new Error("Google authentication failed", { cause: 401 }));
  }





  if (!user) {
    user = await User.create({
      firstName: data.given_name,
      lastName: data.family_name,
      email: data.email,
      provider: "google",
      isConfirmed: true,
    });
  }

  const accessToken = generateToken({ payload: { id: user._id }, options: { expiresIn: "1h" } });
  return res.json({ message: "Google sign-up successful", accessToken });
});

export const signInWithGoogle = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  const googleURL = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
  const response = await fetch(googleURL);
  const data = await response.json();

  if (!data.email) {
    return next(new Error("Google authentication failed", { cause: 401 }));
  }

  const user = await User.findOne({ email: data.email });
  if (!user) {
    return next(new Error("User not registered. Please sign up first.", { cause: 400 }));
  }
  if (user) {
    if (user.deletedAt) {
      return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
    }
  }
  if (user.bannedAt) {
    return next(new Error("Your account has been banned", { cause: 403 }));
  }

  const accessToken = generateToken({ payload: { id: user._id }, options: { expiresIn: "1h" } });
  return res.json({ message: "Google login successful", accessToken });
});


export const sendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user) {
    if (user.deletedAt) {
      return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
    }
    if (user.bannedAt) {
      return next(new Error("Your account has been banned", { cause: 403 }));
    }
  }

  const otpCode = generateOTP();
  console.log(otpCode);

  user.OTP.push({ code: hash({ password: otpCode }), type: "forgetPassword", expiresIn: new Date(Date.now() + 10 * 60 * 1000) });
  await user.save();

  await sendEmail({ to: email, subject: "Password Reset OTP", html: `Your OTP code is: ${otpCode}` });
  return res.json({ message: "OTP sent to email." });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user) {
    if (user.deletedAt) {
      return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
    }
  }

  const validOTP = user.OTP.find(
    (entry) => entry.type === "forgetPassword" && entry.expiresIn > new Date()
  );

  if (!validOTP) {
    return next(new Error("OTP expired or invalid", { cause: 400 }));
  }


  const isMatch = compare({ password: otp, hashedPassword: validOTP.code });


  if (!isMatch) {
    return next(new Error("Incorrect OTP", { cause: 400 }));
  }

  user.OTP = user.OTP.filter((entry) => entry.type !== "forgetPassword");


  user.password = hash({ password: newPassword });
  await user.save();

  return res.json({ message: "Password reset successful" });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  const decoded = verify({ token: refreshToken });
  if (!decoded) return next(new Error("Invalid refresh token", { cause: 401 }));

  const user = await User.findById(decoded.id);
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user) {
    if (user.deletedAt) {
      return next(new Error("Account is deactivated. Contact support.", { cause: 403 }));
    }
    if (user.bannedAt) {
      return next(new Error("Your account has been banned", { cause: 403 }));
    }
  }

  const newAccessToken = generateToken({ payload: { id: user._id }, options: { expiresIn: "1h" } });
  return res.json({ message: "Token refreshed", accessToken: newAccessToken });
});

export const deleteExpiredOTPs = asyncHandler(async (req, res, next) => {
  await User.updateMany({}, { $pull: { OTP: { expiresIn: { $lt: new Date() } } } });
  console.log("Expired OTPs deleted");
  return res.json({ message: "Expired OTPs deleted" });
});

cron.schedule("0 */6 * * *", async () => {
  await deleteExpiredOTPs();
});
