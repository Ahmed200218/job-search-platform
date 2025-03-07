import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as companyService from "./company.service.js";
import * as companyValidation from "./company.validation.js";
import { asyncHandler } from "../../utils/index.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();


router.post("/add", isAuthenticate, upload.fields([{ name: "logo", maxCount: 1 }, { name: "coverPic", maxCount: 1 }, { name: "legalAttachment", maxCount: 1 },]), isValid(companyValidation.addCompany), asyncHandler(companyService.addCompany));

router.put("/update/:companyId", isAuthenticate, upload.fields([{ name: "logo", maxCount: 1 }, { name: "coverPic", maxCount: 1 },]), isValid(companyValidation.updateCompany), asyncHandler(companyService.updateCompany));

router.delete("/soft-delete/:companyId", isAuthenticate, asyncHandler(companyService.softDeleteCompany));

router.get("/search", asyncHandler(companyService.searchCompany));

router.get("/:companyId", asyncHandler(companyService.getCompanyWithJobs));

router.put("/upload-logo/:companyId", isAuthenticate, upload.single("logo"), asyncHandler(companyService.uploadCompanyLogo));

router.put("/upload-cover/:companyId", isAuthenticate, upload.single("coverPic"), asyncHandler(companyService.uploadCompanyCoverPic));

router.delete("/delete-logo/:companyId", isAuthenticate, asyncHandler(companyService.deleteCompanyLogo));

router.delete("/delete-cover/:companyId", isAuthenticate, asyncHandler(companyService.deleteCompanyCoverPic));










export default router;