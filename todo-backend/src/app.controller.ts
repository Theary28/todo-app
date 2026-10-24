import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Public so it can serve as a health check.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
