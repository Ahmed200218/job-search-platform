import mongoose, { Schema, model } from "mongoose";
import { decrypt } from "../../utils/index.js";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    provider: { type: String, enum: ["google", "system"], required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    DOB: { type: Date, required: true, validate: {
        validator: function (value) {
          const ageDiff = new Date().getFullYear() - value.getFullYear();
          return ageDiff >= 18;
        },
        message: "User must be at least 18 years old."
      }
    },
    mobileNumber: { type: String, required: true },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    isConfirmed: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    bannedAt: { type: Date, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changeCredentialTime: { type: Date, default: null },
    profilePic: {
      secure_url: { type: String },
      public_id: { type: String }
    },
    coverPic: {
      secure_url: { type: String },
      public_id: { type: String }
    },
    OTP: [
      {
        code: { type: String, required: true },
        type: { type: String, enum: ["confirmEmail", "forgetPassword"], required: true },
        expiresIn: { type: Date, required: true }
      }
    ]
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.mobileNumber) {
      ret.mobileNumber = decrypt({ data: ret.mobileNumber });
    }
    return ret;
  },
});


userSchema.virtual("username").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = model("User", userSchema);