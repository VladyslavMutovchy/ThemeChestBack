import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers['authorization'] || req.headers['x-solt'];
      if (!authHeader) {
        throw new UnauthorizedException({ message: 'Authorization header missing' });
      }
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

      if (!token) {
        throw new UnauthorizedException({ message: 'Authorization error: malformed token' });
      }
      const user = this.jwtService.verify(token);
      req.user = user;
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: 'Authorization error: invalid token' });
    }
  }
}
