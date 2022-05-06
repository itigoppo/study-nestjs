import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Post()
  async create(@Body() bodies: CreateTodoDto) {
    return await this.service.create(bodies);
  }

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: { id: string }) {
    return await this.service.findOne(Number(params.id));
  }

  @Patch(':id')
  async update(@Param() params: { id: string }, @Body() bodies: UpdateTodoDto) {
    return await this.service.update(Number(params.id), bodies);
  }

  @Delete(':id')
  async delete(@Param() params: { id: string }) {
    return await this.service.delete(Number(params.id));
  }
}
