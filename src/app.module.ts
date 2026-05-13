import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './Modules/categories/categories.module';
import { ProductsModule } from './Modules/products/products.module';
import { CartModule } from './Modules/cart/cart.module';
import { OrdersModule } from './Modules/orders/orders.module';
import { UsersModule } from './Modules/users/users.module';
import { AuthModule } from './Modules/auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env-development',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get<string>('DB_DATABASE', 'ecommerce-db'),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', '16102000'),
        port: configService.get<number>('DB_PORT', 5432),
        host: configService.get<string>('DB_HOST', 'localhost'),
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        autoLoadEntities: true,
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['lang'] },
        new CookieResolver(['lang', 'next-locale']),
        AcceptLanguageResolver,
      ],
      loader: I18nJsonLoader,
    }),
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    CacheModule.register({
      ttl: 5000, // 5 seconds
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
 