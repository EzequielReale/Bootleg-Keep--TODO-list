import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto, @Req() req) {
    return this.notesService.create(createNoteDto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('status') status?: 'active' | 'archived',
    @Query('category') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.notesService.findAll(req.user.id, status, categoryId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.notesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Req() req) {
    return this.notesService.update(id, updateNoteDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.notesService.remove(id, req.user.id);
  }

  @Post(':id/categories/:categoryId')
  addCategory(
    @Param('id') noteId: string,
    @Param('categoryId') categoryId: string,
    @Req() req,
  ) {
    return this.notesService.addCategory(noteId, categoryId, req.user.id);
  }

  @Delete(':id/categories/:categoryId')
  removeCategory(
    @Param('id') noteId: string,
    @Param('categoryId') categoryId: string,
    @Req() req,
  ) {
    return this.notesService.removeCategory(noteId, categoryId, req.user.id);
  }
}
