import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import projectService from "../services/project.service";

export class ProjectController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        phase,
        building_type,
        search
      } = req.query;
      const result = await projectService.findAll(Number(page), Number(limit), {
        status: status as string | undefined,
        phase: phase as string | undefined,
        building_type: building_type as string | undefined,
        search: search as string | undefined
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.findById(id);

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await projectService.create(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectService.update(id, req.body);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await projectService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  }
}

export default new ProjectController();
