"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSchema = void 0;
const zod_1 = require("zod");
const project_1 = require("@/types/models/project");
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    cover_image: zod_1.z.string().nullable(),
    address: zod_1.z.string(),
    coordinates: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
    }),
    building_type: zod_1.z.nativeEnum(project_1.BuildingType),
    project_type: zod_1.z.nativeEnum(project_1.ProjectType),
    status: zod_1.z.nativeEnum(project_1.ProjectStatus),
    phase: zod_1.z.nativeEnum(project_1.ProjectPhase),
    progress_percentage: zod_1.z.number(),
    estimated_start_date: zod_1.z.date().nullable(),
    start_date: zod_1.z.date().nullable(),
    estimated_end_date: zod_1.z.date().nullable(),
    end_date: zod_1.z.date().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
    deleted_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=project.js.map