"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectParticipantSchema = void 0;
const zod_1 = require("zod");
const project_participant_1 = require("@/types/models/project-participant");
exports.ProjectParticipantSchema = zod_1.z.object({
    id: zod_1.z.string(),
    project_id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    role: zod_1.z.nativeEnum(project_participant_1.ProjectRole),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date().nullable(),
});
//# sourceMappingURL=project-participant.js.map