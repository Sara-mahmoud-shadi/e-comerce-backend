import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get translated hello message' })
  @ApiResponse({ status: 200, description: 'Return translated greeting.' })
  getHello(): string {
    const lang = I18nContext.current()?.lang || 'ar';
    return this.i18n.t('common.HELLO', { lang });
  }
}
