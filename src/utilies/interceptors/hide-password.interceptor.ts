import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HidePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.removePassword(data)),
    );
  }

  private removePassword(data: any): any {
    // If data is an array, map over it
    if (Array.isArray(data)) {
      return data.map((item) => this.removePassword(item));
    }

    // If data is a Date, return it as is
    if (data instanceof Date) {
      return data;
    }

    // If data is an object, remove password and recurse
    if (data !== null && typeof data === 'object') {
      // Create a shallow copy to avoid mutating the original object if it's an entity
      const { password, ...rest } = data;
      
      // Recursively remove password from nested objects/arrays
      for (const key in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, key)) {
          rest[key] = this.removePassword(rest[key]);
        }
      }
      return rest;
    }

    return data;
  }
}
