import joi from "joi";

export const addCompany = joi.object({
  companyName: joi.string().min(3).max(50).required(),
  description: joi.string().min(10).required(),
  industry: joi.string().min(3).required(),
  address: joi.string().min(5).required(),
  numberOfEmployees: joi.string().valid("1-10", "11-20", "21-50", "51-100", "101-500", "500+").required(),
  companyEmail: joi.string().email().required(),
});

export const updateCompany = joi.object({
  companyName: joi.string().min(3).max(50),
  description: joi.string().min(10),
  industry: joi.string().min(3),
  address: joi.string().min(5),
  numberOfEmployees: joi.string().valid("1-10", "11-20", "21-50", "51-100", "101-500", "500+"),
  companyEmail: joi.string().email(),
}).min(1);
