import { generate } from "randomstring";
import { sendEmail } from "../Email/index.js";

export function generateOTP() {
  return generate({
    length: 5,
    charset: "numeric",
  });
}


export async function sendOTP(email, otp) {
  const subject = "Your OTP Code";
  const html = `<p>Your OTP code is: <strong>${otp}</strong></p>`;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

export const otpTimer = new Date(Date.now() + 5*60*1000);


