import { Router } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';

const router = Router();

// Register all route modules
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);

export default router;

