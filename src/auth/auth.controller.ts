import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Get('login')
    async login(@Res() res: Response, @Req() req: Request) {
        try {
            const redirectTo = await this.authService.signInWithAzure();
            // Redireciona o usuário para a página de login do provedor OAuth
            return res.redirect(redirectTo);
          } catch (error) {
            return res.status(400).json({ error: error.message });
          }
    }
}
