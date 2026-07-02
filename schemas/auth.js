"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const fields_1 = require("./fields");
// Login schema
exports.loginSchema = zod_1.z.object({
    email: fields_1.emailSchema,
    password: zod_1.z.string().min(1, "Password is required")
});
// Signup schema (with confirm password)
exports.signupSchema = zod_1.z
    .object({
    email: fields_1.emailSchema,
    password: fields_1.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, "Please confirm your password")
})
    .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
});
// Forgot password schema
exports.forgotPasswordSchema = zod_1.z.object({
    email: fields_1.emailSchema
});
// Reset password schema (with confirm)
exports.resetPasswordSchema = zod_1.z
    .object({
    password: fields_1.passwordSchema,
    confirmPassword: zod_1.z.string().min(1, "Please confirm your password")
})
    .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
});
//# sourceMappingURL=auth.js.map