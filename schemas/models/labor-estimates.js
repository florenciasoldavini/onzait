"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaborEstimateSchema = void 0;
const zod_1 = require("zod");
exports.LaborEstimateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    project_id: zod_1.z.string(),
    trade_id: zod_1.z.string(),
    cost: zod_1.z.number(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=labor-estimates.js.map