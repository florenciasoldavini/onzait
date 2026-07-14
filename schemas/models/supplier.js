"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierSchema = void 0;
const zod_1 = require("zod");
exports.SupplierSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    name: zod_1.z.string(),
    website: zod_1.z.string().nullable(),
    phone_number: zod_1.z.string().nullable(),
    address: zod_1.z.string().nullable(),
    coordinates: zod_1.z.object({
        lat: zod_1.z.number().nullable(),
        lng: zod_1.z.number().nullable(),
    }),
    opening_hours: zod_1.z.array(zod_1.z.string()),
    notes: zod_1.z.string().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=supplier.js.map