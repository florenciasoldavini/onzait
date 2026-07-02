"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeSchema = void 0;
const zod_1 = require("zod");
exports.TradeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=trade.js.map