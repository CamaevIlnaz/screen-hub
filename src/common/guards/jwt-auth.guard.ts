import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

type JwtPayload = {
  sub: number;
  login: string;
  role: string;
};

type RequestWithUser = FastifyRequest & {
  cookies?: Record<string, string | undefined>;
  user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const cookieName = this.configService.getOrThrow<string>('app.cookieName');
    const token = request.cookies?.[cookieName];

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Требуется авторизация');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      });

      request.user = {
        id: payload.sub,
        login: payload.login,
        role: payload.role,
      };

      return true;
    } catch {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
