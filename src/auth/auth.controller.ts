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
    
    @Get('logout')
    logout(@Res() res: Response) {
        try {
        } catch (error) {
        }
    }

    @Get('callback')
    async callback(@Req() req: Request, @Res() res: Response) {
      await this.authService.getAccessToken({res, req})
    }
}
