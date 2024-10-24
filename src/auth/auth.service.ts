import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from 'src/services/prisma.service';
import { SupabaseService } from 'src/services/supabase.service';  

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private supabaseClient: SupabaseService, private configService: ConfigService) {}

  private supabase = this.supabaseClient.getSupabase()

  async signInWithAzure() {
    const smartcampusmauaServerUrl = this.configService.get<string>('SMARTCAMPUSMAUA_SERVER_URL')
    const smartcampusmauaServerPort = this.configService.get<string>('SMARTCAMPUSMAUA_SERVER_PORT')

    // Inicia o fluxo de login com o provedor de OAuth
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${smartcampusmauaServerUrl}:${smartcampusmauaServerPort}/auth/callback`, // URL para redirecionar após o login
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

  async setCookie({req, res}) {
    try {
      const GmsWebUrl = this.configService.get<string>('GMS_WEB_URL')
      const GmsWebPort = this.configService.get<string>('GMS_WEB_PORT')

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
      return res.redirect(`${GmsWebUrl}:${GmsWebPort}/gms/reservatorios`);      
    } catch (error) {
      console.error('Error during callback processing:', error.message);
      return res.status(400).send('Authentication failed');
    }
  }

  async getUserDisplayName() {
    const { data } = await this.supabase.auth.getSession();
    if (data.session){
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

  async logOutWithAzure(res: Response) {
    const { error } = await this.supabase.auth.signOut()

    if (error){
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