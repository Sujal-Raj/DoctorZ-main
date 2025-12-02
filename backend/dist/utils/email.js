// utils/email.ts
import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER, // your email
        pass: process.env.MAIL_PASS, // app password
    },
});
//# sourceMappingURL=email.js.map