import joi from "joi";

export const updateUser = joi
  .object({
    firstName: joi.string().min(2).max(30),
    lastName: joi.string().min(2).max(30),
    gender: joi.string().valid("Male", "Female"),
    DOB: joi.date().less("now").messages({
      "date.less": "Date of Birth must be in the past",
    }),
    mobileNumber: joi.string().pattern(/^\d{10,15}$/).messages({
      "string.pattern.base": "Mobile number must be between 10-15 digits",
    }),
  })
  .min(1)
  .required();

export const updatePassword = joi.object({
  oldPassword: joi.string().min(6).required(),
  newPassword: joi.string().min(6).required(),
});