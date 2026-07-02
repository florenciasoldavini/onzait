"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSchema = void 0;
const zod_1 = require("zod");
exports.ClientSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    first_name: zod_1.z.string(),
    last_name: zod_1.z.string().nullable(),
    avatar: zod_1.z.string().nullable(),
    email: zod_1.z.string().nullable(),
    phone_number: zod_1.z.string().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable()
});
//# sourceMappingURL=client.js.map