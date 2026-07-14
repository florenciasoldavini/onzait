"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceSchema = void 0;
const zod_1 = require("zod");
exports.AttendanceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    date: zod_1.z.date(),
    project_id: zod_1.z.string(),
    worker_id: zod_1.z.string(),
    present: zod_1.z.boolean(),
    hours_worked: zod_1.z.number().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable()
});
//# sourceMappingURL=attendance.js.map