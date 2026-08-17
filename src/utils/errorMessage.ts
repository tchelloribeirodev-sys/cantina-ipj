// Converte um erro qualquer (do Supabase, de rede, etc.) numa mensagem
// amigável para exibir ao usuário. Prioriza detectar problemas de conexão,
// já que este sistema costuma ser usado em locais com internet instável
// (ex.: wi-fi de acampamento) — nesses casos, a mensagem genérica do
// Supabase ("Failed to fetch") confunde mais do que ajuda.
export function getFriendlyErrorMessage(err: unknown, fallback: string): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Sem conexão com a internet. Verifique o wi-fi ou os dados móveis e tente novamente.';
  }

  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
