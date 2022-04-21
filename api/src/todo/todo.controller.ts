import { Body, Controller, Post } from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Post()
  async create(@Body() bodies: { title: string; description: string }) {
    return await this.service.create(bodies.title, bodies.description);
  }
}
