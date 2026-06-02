import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodExceptionFilter } from './utilies/zod-exception.filter';
import { HidePasswordInterceptor } from './utilies/interceptors/hide-password.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import * as express from 'express';

// Cache the app instance across serverless invocations (avoids cold-start per request)
let cachedApp: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Suppress logs in production for cleaner Vercel output
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
    // Disable built-in body parser to avoid conflicts with our custom one
    bodyParser: false,
  });

  // Parse JSON bodies regardless of Content-Type header.
  // This handles clients that send JSON with wrong Content-Type (e.g. text/plain).
  app.use((req: any, _res: any, next: any) => {
    express.json({ limit: '10mb', type: '*/*' })(req, _res, (err) => {
      if (err) {
        // If JSON parse failed, try urlencoded
        express.urlencoded({ extended: true, limit: '10mb' })(req, _res, next);
      } else {
        next();
      }
    });
  });

  const configService = app.get(ConfigService);

  // CORS — allow the frontend origin (set ALLOWED_ORIGINS in Vercel env vars)
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

  // Serve uploaded files as static assets (local dev only — Vercel filesystem is read-only)
  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    });
  }

  // Enable global validation using zod
  app.useGlobalPipes(new ZodValidationPipe());

  // Enable global exception filter for Zod
  app.useGlobalFilters(new ZodExceptionFilter());

  // Hides password from response for all controllers
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

  // Required for Vercel serverless — init without listening on a port
  await app.init();

  cachedApp = app;
  return cachedApp;
}

// ─── Vercel Serverless Handler ────────────────────────────────────────────────
// Vercel will call this exported function for every incoming request.
export default async function handler(req: any, res: any) {
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
}

// ─── Local Development ────────────────────────────────────────────────────────
// When running locally (not in Vercel), start a normal HTTP server.
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

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

  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ZodExceptionFilter());
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

// Only start the HTTP server when NOT running on Vercel
if (process.env.VERCEL !== '1') {
  bootstrap();
}
