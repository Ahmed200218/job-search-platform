import { Application } from "../../db/models/application.model.js";
import { Company } from "../../db/models/company.model.js";
import { Job } from "../../db/models/job.model.js";
import cloudinary from "../../utils/cloudinary/cloudinary.js";
import { asyncHandler, sendEmail } from "../../utils/index.js";

export const addJob = asyncHandler(async (req, res, next) => {
  const { companyId, jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;
  const userId = req.authUser._id;


  const company = await Company.findById(companyId);
  if (!company || !company.approvedByAdmin) {
    return next(new Error("Company is not approved to post jobs", { cause: 403 }));
  }


  const isOwner = company.createdBy.toString() === userId.toString();
  const isHR = company.HRs.some(hr => hr.toString() === userId.toString());

  if (!isOwner && !isHR) {
    return next(new Error("You are not authorized to add a job for this company", { cause: 403 }));
  }


  const job = await Job.create({
    companyId,
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: userId,
  });

  return res.status(201).json({ message: "Job added successfully", job });
});

export const updateJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.authUser._id;
  const updateData = req.body;


  const job = await Job.findById(jobId);
  if (!job) return next(new Error("Job not found", { cause: 404 }));


  if (job.addedBy.toString() !== userId.toString()) {
    return next(new Error("You are not authorized to update this job", { cause: 403 }));
  }


  if (job.closed) {
    return next(new Error("This job is closed and cannot be updated", { cause: 400 }));
  }


  updateData.updatedBy = userId;
  const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true });

  return res.json({ message: "Job updated successfully", job: updatedJob });
});

export const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.authUser._id;


  const job = await Job.findById(jobId);
  if (!job) return next(new Error("Job not found", { cause: 404 }));


  const company = await Company.findById(job.companyId);
  if (!company) return next(new Error("Company not found", { cause: 404 }));


  const isOwner = company.createdBy.toString() === userId.toString();
  const isHR = company.HRs.some(hr => hr.toString() === userId.toString());

  if (!isOwner && !isHR) {
    return next(new Error("You are not authorized to delete this job", { cause: 403 }));
  }


  job.closed = true;
  await job.save();

  return res.json({ message: "Job has been closed" });
});

export const getJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = "createdAt", companyName } = req.query;
  const skip = (page - 1) * limit;


  const allowedCompanies = await Company.find({ bannedAt: null }).select("_id");

  const query = { closed: false, companyId: { $in: allowedCompanies.map(c => c._id) } };


  if (companyName) {
    const company = await Company.findOne({ companyName: { $regex: companyName, $options: "i" }, bannedAt: null });
    if (!company) return res.json({ message: "No jobs found", jobs: [] });
    query.companyId = company._id;
  }


  const [jobs, totalCount] = await Promise.all([
    Job.find(query).skip(skip).limit(limit).sort({ [sort]: -1 }),
    Job.countDocuments(query),
  ]);

  return res.json({
    message: "Jobs retrieved successfully",
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    jobs,
  });
});


export const getFilteredJobs = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { closed: false };


  const allowedCompanies = await Company.find({ bannedAt: null }).select("_id");
  query.companyId = { $in: allowedCompanies.map(c => c._id) };


  if (workingTime) query.workingTime = workingTime;


  if (jobLocation) query.jobLocation = jobLocation;


  if (seniorityLevel) query.seniorityLevel = seniorityLevel;


  if (jobTitle) query.jobTitle = { $regex: jobTitle, $options: "i" };


  if (technicalSkills) {
    const skillsArray = technicalSkills.split(",");
    query.technicalSkills = { $in: skillsArray };
  }


  const [jobs, totalCount] = await Promise.all([
    Job.find(query).skip(skip).limit(limit).sort({ [sort]: -1 }),
    Job.countDocuments(query),
  ]);

  return res.json({
    message: "Filtered jobs retrieved successfully",
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    jobs,
  });
});

export const getJobApplications = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { page = 1, limit = 10, sort = "createdAt" } = req.query;
  const skip = (page - 1) * limit;
  const userId = req.authUser._id;


  const job = await Job.findById(jobId).populate({
    path: "applications",
    options: { skip, limit, sort: { [sort]: -1 } },
    populate: { path: "userId", select: "firstName lastName email profilePic" },
  });

  if (!job) return next(new Error("Job not found", { cause: 404 }));

  return res.json({
    message: "Job applications retrieved successfully",
    totalCount: job.applications.length,
    applications: job.applications,
  });
});


export const applyToJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.authUser._id;


  if (req.authUser.role !== "User") {
    return next(new Error("Only users can apply for jobs", { cause: 403 }));
  }


  if (!req.file) return next(new Error("CV file is required!", { cause: 400 }));


  const job = await Job.findById(jobId);
  if (!job || job.closed) {
    return next(new Error("Job not found or has been closed", { cause: 404 }));
  }


  if (req.file.mimetype !== "application/pdf") {
    return next(new Error("Only PDF files are allowed!", { cause: 400 }));
  }
  const uploadedCV = await cloudinary.uploader.upload(req.file.path, { folder: "job_applications", resource_type: "raw" });


  const application = await Application.create({
    jobId,
    userId,
    userCV: { secure_url: uploadedCV.secure_url, public_id: uploadedCV.public_id },
  });

  return res.status(201).json({ message: "Application submitted successfully", application });
});


export const acceptRejectApplicant = asyncHandler(async (req, res, next) => {
  const { jobId, applicationId } = req.params;
  const { status } = req.body;
  const userId = req.authUser._id;

  console.log(req.body);



  if (!["accepted", "rejected"].includes(status)) {
    return next(new Error("Invalid status. Must be 'accepted' or 'rejected'.", { cause: 400 }));
  }


  const job = await Job.findById(jobId);
  if (!job) return next(new Error("Job not found", { cause: 404 }));


  const company = await Company.findById(job.companyId);
  if (!company) return next(new Error("Company not found", { cause: 404 }));


  const isOwner = company.createdBy.toString() === userId.toString();
  const isHR = company.HRs.some(hr => hr.toString() === userId.toString());

  if (!isOwner && !isHR) {
    return next(new Error("You are not authorized to update application status", { cause: 403 }));
  }


  const application = await Application.findById(applicationId).populate("userId", "email firstName lastName");
  if (!application) return next(new Error("Application not found", { cause: 404 }));


  application.status = status;
  await application.save();


  const subject = status === "accepted" ? "Job Application Accepted" : "Job Application Rejected";
  const message =
    status === "accepted"
      ? `Dear ${application.userId.firstName}, congratulations! Your application for ${job.jobTitle} has been accepted.`
      : `Dear ${application.userId.firstName}, we regret to inform you that your application for ${job.jobTitle} has been rejected.`;

  await sendEmail({ to: application.userId.email, subject, html: `<p>${message}</p>` });

  return res.json({ message: `Application ${status} successfully` });
});






