import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
    const todo = await this.service.findOne(Number(params.id));
    if (!todo) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Missing item(id: ' + params.id + ').',
        },
        404,
      );
    }

    return todo;
  }

  @Patch(':id')
  async update(@Param() params: { id: string }, @Body() bodies: UpdateTodoDto) {
    const todo = await this.service.findOne(Number(params.id));
    if (!todo) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Missing item(id: ' + params.id + ').',
        },
        404,
      );
    }

    return await this.service.update(Number(params.id), bodies);
  }

  @Delete(':id')
  async delete(@Param() params: { id: string }) {
    const todo = await this.service.findOne(Number(params.id));
    if (!todo) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Missing item(id: ' + params.id + ').',
        },
        404,
      );
    }

    return await this.service.delete(Number(params.id));
  }
}
