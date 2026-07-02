"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerContractSchema = void 0;
const zod_1 = require("zod");
const worker_contract_1 = require("@/types/models/worker-contract");
exports.WorkerContractSchema = zod_1.z.object({
    id: zod_1.z.string(),
    worker_id: zod_1.z.string(),
    project_id: zod_1.z.string(),
    payment_type: zod_1.z.nativeEnum(worker_contract_1.PaymentType),
    rate: zod_1.z.number(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=worker-contract.js.map