import cloudinary from "../../utils/cloudinary/cloudinary.js";
import { Company } from "../../db/models/company.model.js";
import { asyncHandler } from "../../utils/index.js";

export const addCompany = asyncHandler(async (req, res, next) => {
    const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;
    const createdBy = req.authUser._id;

    const existingCompany = await Company.findOne({ $or: [{ companyName }, { companyEmail }] });
    if (existingCompany) return next(new Error("Company name or email already exists", { cause: 400 }));

    let logo = { secure_url: "", public_id: "" };
    let coverPic = { secure_url: "", public_id: "" };
    let legalAttachment = { secure_url: "", public_id: "" };

    if (req.files?.logo) {
        const result = await cloudinary.uploader.upload(req.files.logo[0].path, { folder: "company_logos" });
        logo = { secure_url: result.secure_url, public_id: result.public_id };
    }

    if (req.files?.coverPic) {
        const result = await cloudinary.uploader.upload(req.files.coverPic[0].path, { folder: "company_covers" });
        coverPic = { secure_url: result.secure_url, public_id: result.public_id };
    }

    if (req.files?.legalAttachment) {
        const result = await cloudinary.uploader.upload(req.files.legalAttachment[0].path, { folder: "company_legal" });
        legalAttachment = { secure_url: result.secure_url, public_id: result.public_id };
    }

    const company = await Company.create({
        companyName,
        description,
        industry,
        address,
        numberOfEmployees,
        companyEmail,
        createdBy,
        logo,
        coverPic,
        legalAttachment,
    });

    return res.status(201).json({ message: "Company added successfully", company });
});

export const updateCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.authUser._id;
    const updateData = req.body;


    if ("legalAttachment" in updateData) {
        return next(new Error("You cannot update the legal attachment", { cause: 400 }));
    }



    const company = await Company.findOne({ _id: companyId, deletedAt: null });

    if (!company) {
        return next(new Error("Company not found or has been deleted", { cause: 404 }));
    }


    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to update this company", { cause: 403 }));
    }


    if (updateData.companyName || updateData.companyEmail) {
        const existingCompany = await Company.findOne({
            $or: [{ companyName: updateData.companyName }, { companyEmail: updateData.companyEmail }],
            _id: { $ne: companyId },
        });

        if (existingCompany) {
            return next(new Error("Company name or email already exists", { cause: 400 }));
        }
    }


    if (req.files?.logo) {

        if (company.logo.public_id) {
            await cloudinary.uploader.destroy(company.logo.public_id);
        }

        const result = await cloudinary.uploader.upload(req.files.logo[0].path, { folder: "company_logos" });
        updateData.logo = { secure_url: result.secure_url, public_id: result.public_id };
    }

    if (req.files?.coverPic) {

        if (company.coverPic.public_id) {
            await cloudinary.uploader.destroy(company.coverPic.public_id);
        }

        const result = await cloudinary.uploader.upload(req.files.coverPic[0].path, { folder: "company_covers" });
        updateData.coverPic = { secure_url: result.secure_url, public_id: result.public_id };
    }


    const updatedCompany = await Company.findByIdAndUpdate(companyId, updateData, { new: true });

    return res.json({ message: "Company updated successfully", company: updatedCompany });
});

export const softDeleteCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.authUser._id;
    const userRole = req.authUser.role;


    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));


    if (company.createdBy.toString() !== userId.toString() && userRole !== "Admin") {
        return next(new Error("You are not authorized to delete this company", { cause: 403 }));
    }


    company.deletedAt = new Date();
    await company.save();

    return res.json({ message: "Company soft deleted successfully" });
});

export const getCompanyWithJobs = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;


    const company = await Company.findOne({ _id: companyId, deletedAt: null, bannedAt: null })
        .populate({
            path: "jobs",
            match: { deletedAt: null },
            select: "jobTitle jobDescription jobLocation workingTime seniorityLevel",
        })
        .exec();

    if (!company) {
        return next(new Error("Company not found, has been deleted, or is banned", { cause: 404 }));
    }

    return res.json({ message: "Company retrieved successfully", jobs: company.jobs });
});


export const searchCompany = asyncHandler(async (req, res, next) => {
    const { name } = req.query;

    if (!name) {
        return next(new Error("Company name is required for search", { cause: 400 }));
    }


    const companies = await Company.find({
        companyName: { $regex: name, $options: "i" },
        deletedAt: null,
        bannedAt: null,
    }).select("companyName industry address logo.secure_url");

    if (companies.length === 0) {
        return res.json({ message: "No companies found", companies: [] });
    }

    return res.json({ message: "Companies retrieved successfully", companies });
});


export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.authUser._id;

    if (!req.file) {
        return next(new Error("No file uploaded!", { cause: 400 }));
    }


    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));


    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to upload a logo for this company", { cause: 403 }));
    }


    if (company.logo.public_id) {
        await cloudinary.uploader.destroy(company.logo.public_id);
    }


    const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "company_logos" });


    company.logo = { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id };
    await company.save();

    return res.json({ message: "Company logo uploaded successfully", logo: company.logo });


});

export const uploadCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.authUser._id;

    if (!req.file) {
        return next(new Error("No file uploaded!", { cause: 400 }));
    }


    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));


    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to upload a cover picture for this company", { cause: 403 }));
    }


    if (company.coverPic.public_id) {
        await cloudinary.uploader.destroy(company.coverPic.public_id);
    }


    const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "company_covers" });


    company.coverPic = { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id };
    await company.save();

    return res.json({ message: "Company cover picture uploaded successfully", coverPic: company.coverPic });
});

export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.authUser._id;


    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));


    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to delete this company logo", { cause: 403 }));
    }


    if (!company.logo.public_id) {
        return next(new Error("No logo found to delete", { cause: 400 }));
    }


    await cloudinary.uploader.destroy(company.logo.public_id);


    company.logo = { secure_url: "", public_id: "" };
    await company.save();

    return res.json({ message: "Company logo deleted successfully" });
});

export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.authUser._id;


    const company = await Company.findById(companyId);
    if (!company) return next(new Error("Company not found", { cause: 404 }));


    if (company.createdBy.toString() !== userId.toString()) {
        return next(new Error("You are not authorized to delete this company cover picture", { cause: 403 }));
    }


    if (!company.coverPic.public_id) {
        return next(new Error("No cover picture found to delete", { cause: 400 }));
    }


    await cloudinary.uploader.destroy(company.coverPic.public_id);


    company.coverPic = { secure_url: "", public_id: "" };
    await company.save();

    return res.json({ message: "Company cover picture deleted successfully" });
});







