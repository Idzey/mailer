import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import jwtConfig from 'src/config/jwt.config';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { CookieService } from './services/cookie.service';
import { NodemailerModule } from '../nodemailer/nodemailer.module';

@Global()
@Module({
  imports: [PassportModule, JwtModule.register(jwtConfig), NodemailerModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    PasswordService,
    CookieService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
