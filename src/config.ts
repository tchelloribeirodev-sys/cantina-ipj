// Configurações gerais do sistema.
//
// Prefira definir as duas variáveis abaixo em um arquivo ".env" na raiz do
// projeto (crie a partir do ".env.example"), em vez de editar os valores
// aqui diretamente — assim você evita comitar a chave do Supabase no git.
//
// VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
// VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica

export const appConfig = {
  // Ajuste aqui o nome exibido no login e na barra lateral.
  nomeSistema: 'Cantina',

  // Chave pix exibida na mensagem de cobrança enviada via WhatsApp.
  pixKey: 'acampamentoipj@gmail.com',

  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://SEU-PROJETO.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA-CHAVE-ANON-PUBLICA',

  // Usada para assinar o token JWT que mantém o login salvo no navegador por
  // até 1 dia (ver src/lib/authToken.ts), evitando pedir login novamente a
  // cada acesso. Como este é um app front-end puro (sem servidor próprio),
  // essa chave fica visível no código enviado ao navegador — ela serve para
  // controlar a expiração da sessão, não como proteção contra usuários mal
  // intencionados com acesso ao código-fonte.
  jwtSecret: import.meta.env.VITE_JWT_SECRET || 'cantina-ipj-dev-secret-troque-em-producao',
};
