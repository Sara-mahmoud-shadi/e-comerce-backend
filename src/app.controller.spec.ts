import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nService } from 'nestjs-i18n';

describe('AppController', () => {
  let appController: AppController;
  let mockI18nService: Partial<I18nService>;

  beforeEach(async () => {
    mockI18nService = {
      t: jest.fn().mockImplementation((key: string, options?: any) => {
        if (key === 'common.HELLO') {
          return options?.lang === 'en' ? 'Hello' : 'مرحباً';
        }
        return key;
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "مرحباً" by default (Arabic fallback)', () => {
      expect(appController.getHello()).toBe('مرحباً');
    });
  });
});
