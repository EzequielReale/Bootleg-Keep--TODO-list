import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: { id: userId },
    });
    return await this.categoryRepository.save(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    return await this.categoryRepository.find({ where: { user: { id: userId } } });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id, user: { id: userId } } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }
    return await this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id, user: { id: userId } } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    await this.categoryRepository.remove(category);
  }
}
