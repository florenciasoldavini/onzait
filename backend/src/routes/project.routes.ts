import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  CreateProjectSchema,
  ProjectQuerySchema,
  UpdateProjectSchema
} from "../schemas/project.schema";
import projectController from "../controllers/project.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/projects - Get all projects with pagination and filters
router.get("/", validateQuery(ProjectQuerySchema), (req, res) =>
  projectController.getAll(req as any, res)
);

// GET /api/projects/:id - Get project by ID
router.get("/:id", (req, res) => projectController.getById(req as any, res));

// POST /api/projects - Create new project
router.post("/", validateBody(CreateProjectSchema), (req, res) =>
  projectController.create(req as any, res)
);

// PUT /api/projects/:id - Update project
router.put("/:id", validateBody(UpdateProjectSchema), (req, res) =>
  projectController.update(req as any, res)
);

// DELETE /api/projects/:id - Soft delete project
router.delete("/:id", (req, res) => projectController.delete(req as any, res));

export default router;
