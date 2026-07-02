"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoSchema = void 0;
const zod_1 = require("zod");
const photo_1 = require("@/types/models/photo");
exports.PhotoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    project_id: zod_1.z.string(),
    url: zod_1.z.string(),
    category: zod_1.z.nativeEnum(photo_1.PhotoCategory),
    notes: zod_1.z.string().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=photo.js.map