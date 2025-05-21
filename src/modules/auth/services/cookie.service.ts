import { Injectable } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

@Injectable()
export class CookieService {
  private setCookie(
    res: Response,
    name: string,
    value: string,
    options: CookieOptions,
  ) {
    res.cookie(name, value, options);
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV ? 'none' : 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    };

    this.setCookie(res, 'refresh_token', refreshToken, options);
  }

  getCookie(req: Request, name: string) {
    return req.cookies[name] as string;
  }

  clearCookie(res: Response, name: string) {
    res.clearCookie(name);
  }
}
