"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMaterialSchema = void 0;
const zod_1 = require("zod");
exports.ProjectMaterialSchema = zod_1.z.object({
    id: zod_1.z.string(),
    project_id: zod_1.z.string(),
    material_id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    unit_price: zod_1.z.number(),
    purchase_due_date: zod_1.z.date().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=project-material.js.map