import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Language } from './language.decorator';

describe('@Language decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class TestController {
      test(@decorator() lang: string) {}
    }
    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    return args[Object.keys(args)[0]].factory;
  }

  it('should return request["language"] if present', () => {
    const factory = getParamDecoratorFactory(Language);
    const mockRequest = { language: 'en' };
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };

    const result = factory(null, mockExecutionContext);
    expect(result).toBe('en');
  });

  it('should fallback to "ar" if request["language"] is not present', () => {
    const factory = getParamDecoratorFactory(Language);
    const mockRequest = {};
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };

    const result = factory(null, mockExecutionContext);
    expect(result).toBe('ar');
  });
});
