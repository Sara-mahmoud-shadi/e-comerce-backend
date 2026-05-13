import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/utilies/enums/user-role';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user && user.role === UserRole.ADMIN) {
      return true;
    }
    throw new ForbiddenException('Only admins can perform this action');
  }
}
