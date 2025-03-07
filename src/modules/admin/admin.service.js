import { User } from "../../db/models/user.model.js";
import { asyncHandler } from "../../utils/index.js";
import { Company } from "../../db/models/company.model.js";

export const banUnbanUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const adminId = req.authUser._id;
  
    
    if (req.authUser.role !== "Admin") {
      return next(new Error("Only admins can perform this action", { cause: 403 }));
    }
  
    const user = await User.findById(userId);
    if (!user) return next(new Error("User not found", { cause: 404 }));
  
  
    user.bannedAt = user.bannedAt ? null : Date.now();
    await user.save();
  
    return res.json({
      message: user.bannedAt ? "User has been banned" : "User has been unbanned",
    });
  });
  
  export const banUnbanCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const adminId = req.authUser._id;
  
   
    if (req.authUser.role !== "Admin") {
      return next(new Error("Only admins can perform this action", { cause: 403 }));
    }
  
  
    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));
  
    
    company.bannedAt = company.bannedAt ? null : Date.now();
    await company.save();
  
    return res.json({
      message: company.bannedAt ? "Company has been banned" : "Company has been unbanned",
    });
  });

  export const approveCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
  
   
    if (req.authUser.role !== "Admin") {
      return next(new Error("Only admins can perform this action", { cause: 403 }));
    }
  
  
    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));
  
   
    company.approvedByAdmin = true;
    await company.save();
  
    return res.json({ message: "Company has been approved successfully" });
  });
  
  