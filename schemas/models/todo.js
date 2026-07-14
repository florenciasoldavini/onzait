"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoSchema = void 0;
const zod_1 = require("zod");
exports.TodoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    name: zod_1.z.string(),
    is_done: zod_1.z.boolean(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=todo.js.map