import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Post()
  async create(@Body() bodies: { title: string; description: string }) {
    return await this.service.create(bodies.title, bodies.description);
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
  async update(
    @Param() params: { id: string },
    @Body() bodies: { title: string; description: string },
  ) {
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

    return await this.service.update(
      Number(params.id),
      bodies.title,
      bodies.description,
    );
  }
}
