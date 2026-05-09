import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema
} from "../schemas/user.schema";
import userController from "../controllers/user.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users - Get all users with pagination
router.get("/", validateQuery(UserQuerySchema), (req, res) =>
  userController.getAll(req as any, res)
);

// GET /api/users/:id - Get user by ID
router.get("/:id", (req, res) => userController.getById(req as any, res));

// POST /api/users - Create new user
router.post("/", validateBody(CreateUserSchema), (req, res) =>
  userController.create(req as any, res)
);

// PUT /api/users/:id - Update user
router.put("/:id", validateBody(UpdateUserSchema), (req, res) =>
  userController.update(req as any, res)
);

// DELETE /api/users/:id - Soft delete user
router.delete("/:id", (req, res) => userController.delete(req as any, res));

export default router;
