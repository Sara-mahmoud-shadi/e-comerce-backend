import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodExceptionFilter } from './utilies/zod-exception.filter';
import { HidePasswordInterceptor } from './utilies/interceptors/hide-password.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // CORS — allow the frontend origin (set ALLOWED_ORIGINS in Railway env vars)
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'lang'],
    credentials: true,
  });

  // Serve uploaded files as static assets
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Enable global validation using zod
  app.useGlobalPipes(new ZodValidationPipe());

  // Enable global exception filter for Zod
  app.useGlobalFilters(new ZodExceptionFilter());

  // hides password from response for all controllers
  app.useGlobalInterceptors(new HidePasswordInterceptor());

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('The E-Commerce backend API documentation')
    .setVersion('1.0')
    .addTag('ecommerce')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

