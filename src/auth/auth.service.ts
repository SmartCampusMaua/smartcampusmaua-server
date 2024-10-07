import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from 'src/services/prisma.service';
import { SupabaseService } from 'src/services/supabase.service';

ConfigModule.forRoot()

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private supabaseClient: SupabaseService) {}

  private supabase = this.supabaseClient.getSupabase()

  async signInWithAzure() {
    // Inicia o fluxo de login com o provedor de OAuth
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: process.env.CALLBACK_URL, // URL para redirecionar após o login
        scopes: 'email'
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Retorna a URL para redirecionar o usuário para o provedor OAuth
    return data.url;
  }

  async getSession(req: { query: { code: string; }; }) {
    try {
      const { code } = req.query;

      if (!code) {
        throw new Error('Code is missing');
      }

      const session = await this.supabase.auth.exchangeCodeForSession(code)      

      return session 
    } catch (error) {
      console.log(error)
    }
  }

  async setCookie({req, res}) {
    try {
      const session = await this.getSession(req)
      // Verifica se expires_in é um número
      const expiresInMs = session.data.session.expires_in * 1000;
      if (isNaN(expiresInMs)) {
          throw new Error('Invalid expiration time');
      }

      // Cria o cookie de sessão
      res.cookie('_session', session.data.session.access_token, { 
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: expiresInMs,
      });
      
      const isUserCreated = await this.prisma.user.findUnique({
        where: {
          userId: session.data.user.id,
        }
      })

      if (!isUserCreated)
        await this.prisma.user.create({
          data: {
            userId: session.data.user.id,
            darkmode: false,          
          },
        })      
    
      // Redireciona o usuário de volta para a aplicação
      console.log(await this.supabase.auth.getUser())
      return res.redirect('http://localhost:3000/');      
    } catch (error) {
      console.error('Error during callback processing:', error.message);
      return res.status(400).send('Authentication failed');
    }
  }

  async logOutWithAzure(res: Response) {
    const { error } = await this.supabase.auth.signOut()

    if (error){
      return error.message
    }

    // Remove o cookie de sessão
    res.clearCookie('_session', {
      httpOnly: true,
      secure: process.env.DEPLOY_MODE === 'prod',
      path: '/',
    });   
  }

  async checkSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();

    if (session) {
      return true
    } else {
      return false
    }
  }
}