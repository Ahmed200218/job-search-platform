import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/index.js";
import * as adminService from "./admin.service.js";


const router = Router();

router.put("/ban-user/:userId", isAuthenticate, asyncHandler(adminService.banUnbanUser));

router.put("/ban-company/:companyId", isAuthenticate, asyncHandler(adminService.banUnbanCompany));

router.put("/approve-company/:companyId", isAuthenticate, asyncHandler(adminService.approveCompany));




export default router;