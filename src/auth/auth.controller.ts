import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request  } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService, private authService: AuthService) {}
  
  @Get('login')
  async login(@Res() res: Response) {
    try {
      const redirectTo = await this.authService.signInWithAzure();
      // Redireciona o usuário para a página de login do provedor OAuth
      return res.redirect(redirectTo);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      await this.authService.setCookie({res, req})
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    try {
      const loginPageUrl = this.configService.get<string>('SMARTCAMPUSMAUA_WEB_URL')
      const loginPagePort = this.configService.get<string>('SMARTCAMPUSMAUA_WEB_PORT')
      await this.authService.logOutWithAzure(res);
      return res.redirect(`${loginPageUrl}:${loginPagePort}`);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Get('check-session')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    try {
      const sessionCookie = req.cookies['_session'];
      if (sessionCookie ) {
        return res.json({ isAuthenticated: await this.authService.checkSession() });
      } else {
        return res.json({ isAuthenticated: false})
      } 
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Get('displayname')
  async getDisplayName(@Res() res: Response) {
    try {
      const displayName = await this.authService.getUserDisplayName();
      return res.json({ displayName }); // Retornando o nome formatado
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter o nome de exibição' });
    }
  }
}

