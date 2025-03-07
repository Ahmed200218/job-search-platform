import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as jobService from "./job.service.js";
import * as jobValidation from "./job.validation.js";
import { asyncHandler } from "../../utils/index.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();


router.post("/add", isAuthenticate, isValid(jobValidation.addJob), asyncHandler(jobService.addJob));

router.put("/update/:jobId", isAuthenticate, isValid(jobValidation.updateJob), asyncHandler(jobService.updateJob));

router.delete("/delete/:jobId", isAuthenticate, asyncHandler(jobService.deleteJob));

router.get("/filter", asyncHandler(jobService.getFilteredJobs));

router.get("/:companyId?", asyncHandler(jobService.getJobs));

router.get("/:jobId/applications", isAuthenticate, asyncHandler(jobService.getJobApplications));





router.post("/:jobId/apply", isAuthenticate, upload.single("userCV"), asyncHandler(jobService.applyToJob));

router.put("/:jobId/application/:applicationId", isAuthenticate, asyncHandler(jobService.acceptRejectApplicant));










export default router;
