import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RateRecipeDto } from './dto/rate-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

type CurrentUserPayload = {
  userId: number;
  email: string;
};

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipesService.create(user.userId, dto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.recipesService.findAll(search);
  }


  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.recipesService.findMine(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rate')
  rate(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateRecipeDto,
  ) {
    return this.recipesService.rate(user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recipesService.remove(user.userId, id);
  }
}
