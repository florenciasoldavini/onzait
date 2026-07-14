"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = require("zod");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    first_name: zod_1.z.string(),
    last_name: zod_1.z.string(),
    avatar: zod_1.z.string().nullable(),
    email: zod_1.z.string(),
    phone_number: zod_1.z.string().nullable(),
    role: zod_1.z.string(),
    welcome_email_sent_at: zod_1.z.date().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=user.js.map
