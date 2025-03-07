import joi from "joi";

export const addJob = joi.object({
  jobTitle: joi.string().min(3).max(100).required(),
  jobLocation: joi.string().valid("onsite", "remote", "hybrid").required(),
  workingTime: joi.string().valid("part-time", "full-time").required(),
  seniorityLevel: joi.string().valid("Fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO").required(),
  jobDescription: joi.string().min(10).required(),
  technicalSkills: joi.array().items(joi.string()).min(1).required(),
  softSkills: joi.array().items(joi.string()).min(1).required(),
  companyId: joi.string().required(),
});

export const updateJob = joi.object({
  jobTitle: joi.string().min(3).max(100),
  jobLocation: joi.string().valid("onsite", "remote", "hybrid"),
  workingTime: joi.string().valid("part-time", "full-time"),
  seniorityLevel: joi.string().valid("Fresh", "Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"),
  jobDescription: joi.string().min(10),
  technicalSkills: joi.array().items(joi.string()).min(1),
  softSkills: joi.array().items(joi.string()).min(1),
}).min(1);
