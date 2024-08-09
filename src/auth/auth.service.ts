import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Response } from 'express';



ConfigModule.forRoot()

@Injectable()
export class AuthService {
  private supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      detectSessionInUrl: true,
      flowType: 'pkce',
  }
  });

  async signInWithAzure() {
    // Inicia o fluxo de login com o provedor de OAuth
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: process.env.CALLBACK_URL, // URL para redirecionar após o login
        scopes: 'email',
      },
      
    });

    if (error) {
      throw new Error(error.message);
    }

    // Retorna a URL para redirecionar o usuário para o provedor OAuth
    return data.url;
  }

  async getAccessToken({req, res}) {
    try {
      const { code } = req.query;

      if (!code) {
        throw new Error('Code is missing');
      }

      const session = await this.supabase.auth.exchangeCodeForSession(code)
      
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

      // Redireciona o usuário de volta para a aplicação
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