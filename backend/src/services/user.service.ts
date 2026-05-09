import type { User } from "@/types/models/user";
import prisma from "../lib/prisma";

export class UserService {
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { first_name: { contains: search, mode: "insensitive" as const } },
            { last_name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } }
          ],
          deleted_at: null
        }
      : { deleted_at: null };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    return { users: users as User[], total };
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null }
    });
    return user as User | null;
  }

  async create(
    data: Omit<User, "id" | "created_at" | "updated_at" | "deleted_at">
  ): Promise<User> {
    const user = await prisma.user.create({
      data: {
        ...data,
        created_at: new Date()
      }
    });
    return user as User;
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "created_at" | "deleted_at">>
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
    return user as User;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

export default new UserService();
