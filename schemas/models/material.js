"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialSchema = void 0;
const zod_1 = require("zod");
const material_1 = require("@/types/models/material");
exports.MaterialSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    photo: zod_1.z.string().nullable(),
    description: zod_1.z.string().nullable(),
    unit_of_measure: zod_1.z.nativeEnum(material_1.UnitOfMeasure),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=material.js.map