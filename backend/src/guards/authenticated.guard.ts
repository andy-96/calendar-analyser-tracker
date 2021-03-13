import { ExecutionContext, Injectable, CanActivate, Logger } from '@nestjs/common'

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger('AuthenticatedGuard')

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    if (request.isAuthenticated() === false) {
      this.logger.warn('User is not authenticated')
      return false
    }
    return true
  }
}