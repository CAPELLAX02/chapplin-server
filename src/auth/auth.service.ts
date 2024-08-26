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

  /**
   * Logs in a user by generating a JWT and setting it as a cookie in the response.
   *
   * @param {User} user - The user entity to log in.
   * @param {Response} response - The HTTP response object to set the cookie on.
   * @returns {Promise<void>} - Resolves when the login process is complete.
   */
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
   * Logs out a user by clearing the 'Authentication' cookie in the response.
   *
   * @param {Response} response - The HTTP response object to clear the cookie from.
   * @returns {void}
   */
  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }

  /**
   * Verifies the WebSocket connection request by extracting the JWT from cookies.
   *
   * Extracts the JWT token from the 'Authentication' cookie in the incoming request
   * and verifies its validity. If valid, returns the decoded token payload.
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
}
