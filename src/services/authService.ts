import { supabase } from '../lib/supabaseClient';
import { clearAuthToken, createAuthToken, getAuthToken, saveAuthToken, verifyAuthToken } from '../lib/authToken';
import type { Usuario } from '../types/user';

// A verificação de usuário/senha acontece dentro do banco, através da função
// "login" (ver supabase-schema.sql). Isso evita expor a tabela "usuarios"
// (com a coluna de senha) para leitura via a chave anônima do Supabase.
//
// IMPORTANTE: a senha é comparada em texto puro no banco. Para um sistema com
// mais usuários ou mais dados sensíveis, o recomendado é migrar para o
// Supabase Auth (ou ao menos armazenar um hash da senha, nunca o texto puro).
export async function login(nome: string, senha: string): Promise<Usuario> {
  const nomeParam = nome.trim().toLowerCase();
  const { data, error } = await supabase.rpc('login', { p_nome: nomeParam, p_senha: senha });

  if (error) throw error;

  const usuario = Array.isArray(data) ? data[0] : data;

  if (!usuario) {
    throw new Error('Usuário ou senha inválidos.');
  }

  const result: Usuario = { id: usuario.id, nome: usuario.nome };
  saveAuthToken(await createAuthToken(result));

  return result;
}

// Verifica se existe um token JWT salvo no navegador e ainda válido (emitido
// há menos de 1 dia), permitindo restaurar a sessão sem pedir login de novo.
export async function restoreSession(): Promise<Usuario | null> {
  const token = getAuthToken();
  if (!token) return null;

  const usuario = await verifyAuthToken(token);
  if (!usuario) {
    clearAuthToken();
    return null;
  }

  return usuario;
}

export function logout(): void {
  clearAuthToken();
}
