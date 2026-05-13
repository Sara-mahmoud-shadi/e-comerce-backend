import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';
import { I18nContext } from 'nestjs-i18n';
import { ZodValidationException } from 'nestjs-zod';

@Catch(ZodError, ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError | ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const i18n = I18nContext.current(host);

    const zodError = (exception instanceof ZodError ? exception : exception.getZodError()) as ZodError;

    const errors = zodError.issues.map((err) => {
      let message = err.message;
      try {
        // Check if the message is a JSON string containing key and args
        const parsed = JSON.parse(err.message);
        if (parsed.key && i18n) {
          message = i18n.t(parsed.key, { args: parsed.args });
        }
      } catch (e) {
        // If not JSON, treat as a direct key or message
        message = i18n ? i18n.t(err.message) : err.message;
      }
      return {
        field: err.path.join('.'),
        message: message,
      };
    });

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      errors: errors,
    });
  }
}

