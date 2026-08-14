# Conectando ao Supabase

## 1. Criar o projeto
Crie uma conta e um projeto em https://supabase.com (o plano free atende bem este sistema).

## 2. Rodar o schema
No painel do projeto, abra **SQL Editor** → cole o conteúdo de `supabase-schema.sql` → **Run**.

Isso cria as tabelas `produtos`, `contas`, `compras`, `itens_compra`, `fechamentos` e `usuarios`,
além de um usuário padrão para o primeiro acesso:

- **Usuário:** `acampamento`
- **Senha:** `acampa@ipj`

Recomendo trocar essa senha (ou criar outro usuário e excluir o padrão) assim que o sistema
estiver no ar — veja a seção "Segurança" abaixo.

## 3. Instalar a dependência do Supabase
Na raiz do projeto:

```bash
npm install @supabase/supabase-js
```

## 4. Configurar as variáveis de ambiente
Copie `.env.example` para `.env` e preencha com os dados do seu projeto
(**Project Settings → API**, no painel do Supabase):

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Esses valores também podem ser ajustados diretamente em `src/config.ts`, mas o `.env` é a
forma recomendada (evita comitar a chave no git).

## 5. Rodar o projeto normalmente
```bash
npm run dev
```

As telas (Produtos, Contas, Compras, Fechamentos, Dashboard, Relatórios e Login) já fazem as
consultas diretamente no Supabase através dos arquivos em `src/services/`.

## Segurança — vale a pena ler
Este é um sistema simples, pensado para uso interno da equipe da cantina, então o login foi
feito de um jeito direto: uma tabela `usuarios` com nome/senha, verificada por uma função no
próprio banco (`login`, em `supabase-schema.sql`), para não expor a coluna de senha à chave
pública do Supabase. As demais tabelas ficam liberadas para leitura/escrita por quem tiver
essa chave (não há cadastro público, então isso é razoável para o cenário atual).

Se o sistema crescer — mais pessoas com acesso, mais dados sensíveis — vale migrar para o
[Supabase Auth](https://supabase.com/docs/guides/auth) e restringir as políticas de acesso
(RLS) a usuários autenticados, além de nunca guardar senha em texto puro.
