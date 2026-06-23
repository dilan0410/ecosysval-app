import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos para esta ruta
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    // Si la ruta no requiere ningún rol específico, permitir
    if (!requiredRoles) {
      return true;
    }

    // Obtenemos el usuario del request (lo puso el JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario autenticado, denegar
    if (!user) {
      throw new ForbiddenException('No estás autenticado');
    }

    // Verificar si el rol del usuario está en los roles permitidos
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}