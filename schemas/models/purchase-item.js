"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseItemSchema = void 0;
const zod_1 = require("zod");
exports.PurchaseItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    purchase_id: zod_1.z.string(),
    material_id: zod_1.z.string(),
    quantity: zod_1.z.number().nullable(),
    unit_price: zod_1.z.number().nullable(),
    total_price: zod_1.z.number().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=purchase-item.js.map