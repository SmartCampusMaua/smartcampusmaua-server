import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from 'src/services/prisma.service';
import { SupabaseService } from 'src/services/supabase.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private supabaseClient: SupabaseService, private configService: ConfigService) { }

  private supabase = this.supabaseClient.getSupabase()

  async signInWithAzure() {
    // const smartcampusmauaServerUrl = this.configService.get<string>('SMARTCAMPUSMAUA_SERVER_URL')
    // const smartcampusmauaServerPort = this.configService.get<string>('SMARTCAMPUSMAUA_SERVER_PORT')

    // Inicia o fluxo de login com o provedor de OAuth
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        // redirectTo: `${smartcampusmauaServerUrl}:${smartcampusmauaServerPort}/api/auth/callback`, // URL para redirecionar após o login
        // redirectTo: `https://smartcampus-k8s.maua.br/api/auth/callback`, // URL para redirecionar após o login
        redirectTo: `http://localhost:3001/api/auth/callback`, // URL para redirecionar após o login
        scopes: 'email profile'
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

  async setCookie({ req, res }) {
    try {
      // const smartcampusmauaWebUrl = this.configService.get<string>('SMARTCAMPUSMAUA_WEB_URL')
      // const smartcampusmauaWebPort = this.configService.get<string>('SMARTCAMPUSMAUA_WEB_PORT')

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

      if (!isUserCreated) {
        // const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/email`);
        // const response = await fetch(`https://smartcampus-k8s.maua.br/api/auth/email`);
        const response = await fetch(`http://localhost:3001/api/auth/email`);
        const dataEmail = await response.json();
        if (dataEmail)
          await this.prisma.user.create({
            data: {
              userId: session.data.user.id,
              darkmode: false,
              email: dataEmail.displayName
            },
          })
      }

      // Redireciona o usuário de volta para a aplicação
      // return res.redirect(`${smartcampusmauaWebUrl}:${smartcampusmauaWebPort}/modulos`);
      // return res.redirect(`https://smartcampus-k8s.maua.br/modulos`);
      return res.redirect(`http://localhost:3000/modulos`);
    } catch (error) {
      console.error('Error during callback processing:', error.message);
      return res.status(400).send('Authentication failed');
    }
  }

  async getUserDisplayName() {
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      const displayname = data.session.user.user_metadata["full_name"];

      // Verifica se displayname não é nulo ou indefinido
      if (displayname) {
        return displayname
          .split(' ') // Divide o nome completo em palavras
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza cada palavra
          .join(' '); // Junta as palavras novamente com um espaço
      }
      return 'undefined';
    }
    return 'undefined'; // Retorna undefined se o nome não estiver disponível
  }

  async getUserEmail() {
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      const email = data.session.user.user_metadata["email"];

      return email;
    }
  }

  async logOutWithAzure(res: Response) {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      return error.message
    }

    // Remove o cookie de sessão
    res.clearCookie('_session', {
      httpOnly: true,
      secure: this.configService.get<string>('DEPLOY_MODE') === 'prod',
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