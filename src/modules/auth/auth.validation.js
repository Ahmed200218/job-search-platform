import joi from "joi";

export const signUp = joi.object({
  firstName: joi.string().min(2).max(30).required(),
  lastName: joi.string().min(2).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  mobileNumber: joi.string().required(),
  provider: joi.string().valid("google", "system").required(),
}).required();

export const confirmOTP = joi.object({
  email: joi.string().email().required(),
  otp: joi.string().required(),
}).required();

export const signIn = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
}).required();

export const sendOTP = joi.object({
  email: joi.string().email().required(),
}).required();

export const resetPassword = joi.object({
  email: joi.string().email().required(),
  otp: joi.string().required(),
  newPassword: joi.string().min(6).required(),
}).required();

export const refreshToken = joi.object({
  refreshToken: joi.string().required(),
}).required();
