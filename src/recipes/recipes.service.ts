import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RateRecipeDto } from './dto/rate-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateRecipeDto) {
    const recipe = await this.prisma.recipe.create({
      data: {
        title: dto.title,
        description: dto.description,
        ingredients: dto.ingredients,
        instructions: dto.instructions,
        cuisine: dto.cuisine,
        authorId: userId,
      },
    });

    return this.mapRecipeWithAvgRating(recipe, 0, 0);
  }

  async findAll(search?: string) {
    const recipes = await this.prisma.recipe.findMany({
      where: search
        ? {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        ratings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map((r) => {
      const ratingsCount = r.ratings.length;
      const avgRating =
        ratingsCount === 0
          ? 0
          : r.ratings.reduce((sum, rating) => sum + rating.value, 0) / ratingsCount;

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        cuisine: r.cuisine,
        author: r.author,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        averageRating: avgRating,
        ratingsCount,
      };
    });
  }

  async findMine(userId: number) {
    const recipes = await this.prisma.recipe.findMany({
      where: { authorId: userId },
      include: {
        ratings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map((r) => {
      const ratingsCount = r.ratings.length;
      const avgRating =
        ratingsCount === 0
          ? 0
          : r.ratings.reduce((sum, rating) => sum + rating.value, 0) / ratingsCount;

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        cuisine: r.cuisine,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        averageRating: avgRating,
        ratingsCount,
      };
    });
  }

  async findOne(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const ratingsCount = recipe.ratings.length;
    const avgRating =
      ratingsCount === 0
        ? 0
        : recipe.ratings.reduce((sum, rating) => sum + rating.value, 0) / ratingsCount;

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cuisine: recipe.cuisine,
      author: recipe.author,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      averageRating: avgRating,
      ratingsCount,
      ratings: recipe.ratings.map((r) => ({
        id: r.id,
        value: r.value,
        user: r.user,
        createdAt: r.createdAt,
      })),
    };
  }

  async rate(userId: number, recipeId: number, dto: RateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ratings: true },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    await this.prisma.rating.upsert({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
      update: {
        value: dto.value,
      },
      create: {
        userId,
        recipeId,
        value: dto.value,
      },
    });

    const updated = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ratings: true,
      },
    });

    if (!updated) {
      throw new NotFoundException('Recipe not found after rating');
    }

    const ratingsCount = updated.ratings.length;
    const avgRating =
      ratingsCount === 0
        ? 0
        : updated.ratings.reduce((sum, rating) => sum + rating.value, 0) / ratingsCount;

    return this.mapRecipeWithAvgRating(updated, avgRating, ratingsCount);
  }

  async remove(userId: number, recipeId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('You can delete only your own recipes');
    }

    await this.prisma.recipe.delete({
      where: { id: recipeId },
    });

    return { success: true };
  }

  private mapRecipeWithAvgRating(
    recipe: {
      id: number;
      title: string;
      description: string | null;
      ingredients: string;
      instructions: string;
      cuisine: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    averageRating: number,
    ratingsCount: number,
  ) {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cuisine: recipe.cuisine,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      averageRating,
      ratingsCount,
    };
  }
}
