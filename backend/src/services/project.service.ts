import type { Project } from "@/types/models/project";
import prisma from "../lib/prisma";

export class ProjectService {
  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: string;
      phase?: string;
      building_type?: string;
      search?: string;
    }
  ): Promise<{ projects: Project[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = { deleted_at: null };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.phase) {
      where.phase = filters.phase;
    }
    if (filters?.building_type) {
      where.building_type = filters.building_type;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        {
          description: {
            contains: filters.search,
            mode: "insensitive" as const
          }
        },
        { address: { contains: filters.search, mode: "insensitive" as const } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" }
      }),
      prisma.project.count({ where })
    ]);

    return { projects: projects as Project[], total };
  }

  async findById(id: string): Promise<Project | null> {
    const project = await prisma.project.findFirst({
      where: { id, deleted_at: null }
    });
    return project as Project | null;
  }

  async create(
    data: Omit<Project, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        ...data,
        created_at: new Date()
      }
    });
    return project as Project;
  }

  async update(
    id: string,
    data: Partial<Omit<Project, "id" | "created_at" | "deleted_at">>
  ): Promise<Project> {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
    return project as Project;
  }

  async delete(id: string): Promise<void> {
    await prisma.project.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

export default new ProjectService();
