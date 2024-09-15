import { Injectable, UnauthorizedException } from '@nestjs/common';
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
      ...user,
      _id: user._id.toHexString(),
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  verifyWebSocket(request: Request): TokenPayload {
    const cookies: string[] = request.headers.cookie.split('; ');
    const authCookie = cookies.find((cookie) =>
      cookie.startsWith('Authentication='),
    );

    if (!authCookie) {
      throw new UnauthorizedException('Authentication token missing');
    }

    const jwt = authCookie.split('=')[1].trim();

    try {
      return this.jwtService.verify(jwt);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
