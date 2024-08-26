import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.getOrThrow('JWT_EXPIRATION'),
    );

    const tokenPayload: TokenPayload = {
      _id: user._id.toHexString(),
      email: user.email,
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }

  /**
   * Verifies the WebSocket connection request by extracting the JWT from cookies.
   *
   * @param {Request} request - The incoming request object from the WebSocket context.
   * @returns {TokenPayload} - The verified JWT payload containing user information.
   * @throws {UnauthorizedException} - Throws if the JWT is invalid or missing.
   */
  verifyWebSocket(request: Request): TokenPayload {
    const cookies: string[] = request.headers.cookie.split('; ');
    const authCookie = cookies.find((cookie) =>
      cookie.includes('Authentication'),
    );
    const jwt = authCookie.split('Authentication')[1];
    return this.jwtService.verify(jwt);
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
