"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseSchema = void 0;
const zod_1 = require("zod");
exports.PurchaseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    project_id: zod_1.z.string(),
    supplier_id: zod_1.z.string().nullable(),
    total_amount: zod_1.z.number(),
    receipt_url: zod_1.z.string().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=purchase.js.map