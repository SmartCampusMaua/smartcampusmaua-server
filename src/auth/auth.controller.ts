import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request  } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
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
      await this.authService.logOutWithAzure(res);
      return res.redirect(process.env.FRONT_BASE_URL);
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
}
