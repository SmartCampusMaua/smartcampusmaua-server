import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

ConfigModule.forRoot()

@Injectable()
export class AuthService {
  
  private supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  async signInWithAzure() {
    // Inicia o fluxo de login com o provedor de OAuth
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email',
        redirectTo: process.env.REDIRECT_URL, // URL para redirecionar após o login
      },
      
    });

    if (error) {
      throw new Error(error.message);
    }

    // Retorna a URL para redirecionar o usuário para o provedor OAuth
    return data.url;
  }
}