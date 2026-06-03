import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const { categoryIds, ...noteData } = createNoteDto;
    
    let categories: Category[] = [];
    if (categoryIds && categoryIds.length > 0) {
      categories = await this.categoryRepository.find({
        where: categoryIds.map(id => ({ id, user: { id: userId } }))
      });
    }

    const note = this.noteRepository.create({
      ...noteData,
      isArchived: noteData.isArchived ?? false,
      isPinned: noteData.isPinned ?? false,
      categories,
      user: { id: userId },
    });
    return await this.noteRepository.save(note);
  }

  async findAll(userId: string, status?: string, categoryId?: string, search?: string): Promise<Note[]> {
    const queryBuilder = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .where('note.user_id = :userId', { userId });

    if (!categoryId) {
      if (status === 'active') {
        queryBuilder.andWhere('note.isArchived = :isArchived', { isArchived: false });
      } else if (status === 'archived') {
        queryBuilder.andWhere('note.isArchived = :isArchived', { isArchived: true });
      }
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(note.title) LIKE LOWER(:search) OR LOWER(note.content) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy('note.isPinned', 'DESC').addOrderBy('note.id', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { categories: true },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    
    if (updateNoteDto.title !== undefined) note.title = updateNoteDto.title;
    if (updateNoteDto.content !== undefined) note.content = updateNoteDto.content;
    if (updateNoteDto.isArchived !== undefined) note.isArchived = updateNoteDto.isArchived;
    if (updateNoteDto.isPinned !== undefined) note.isPinned = updateNoteDto.isPinned;

    if (updateNoteDto.categoryIds !== undefined) {
      if (updateNoteDto.categoryIds.length > 0) {
        note.categories = await this.categoryRepository.find({
          where: updateNoteDto.categoryIds.map(categoryId => ({ id: categoryId, user: { id: userId } }))
        });
      } else {
        note.categories = [];
      }
    }

    return await this.noteRepository.save(note);
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.noteRepository.remove(note);
  }

  async addCategory(noteId: string, categoryId: string, userId: string): Promise<Note> {
    const note = await this.findOne(noteId, userId);
    const category = await this.categoryRepository.findOne({ where: { id: categoryId, user: { id: userId } } });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const hasCategory = note.categories.some((c) => c.id === category.id);
    if (!hasCategory) {
      note.categories.push(category);
      await this.noteRepository.save(note);
    }

    return note;
  }

  async removeCategory(noteId: string, categoryId: string, userId: string): Promise<Note> {
    const note = await this.findOne(noteId, userId);
    
    note.categories = note.categories.filter((c) => c.id !== categoryId);
    await this.noteRepository.save(note);

    return note;
  }
}

