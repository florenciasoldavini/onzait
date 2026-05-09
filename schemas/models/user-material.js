"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMaterialSchema = void 0;
const zod_1 = require("zod");
exports.UserMaterialSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    material_id: zod_1.z.string(),
    estimated_price: zod_1.z.number(),
    notes: zod_1.z.string().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=user-material.js.map