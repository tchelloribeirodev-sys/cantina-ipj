-- ============================================================
-- Cantina — schema para Supabase (Postgres)
--
-- Como usar:
-- 1. Crie um projeto em https://supabase.com (plano free).
-- 2. Abra "SQL Editor" no painel do projeto.
-- 3. Cole todo este arquivo e clique em "Run".
-- 4. Copie a "Project URL" e a "anon public key" (em
--    Project Settings > API) para o seu .env (veja .env.example).
-- ============================================================

-- (o "emoji_indice" referencia a posição do emoji em src/data/emojis.ts —
-- ex.: 0 = Chocolate, 1 = Refri, etc. Fica nulo quando o produto não tem
-- emoji definido.)

-- Produtos
create table if not exists produtos (
  id bigint generated always as identity primary key,
  descricao text not null,
  preco numeric(10, 2) not null default 0,
  imagem_url text,
  ano integer not null default extract(year from now())::int,
  emoji_indice integer,
  created_at timestamptz not null default now()
);

-- Contas
create table if not exists contas (
  id bigint generated always as identity primary key,
  nome text not null,
  telefone text not null,
  ano integer not null default extract(year from now())::int,
  created_at timestamptz not null default now()
);

-- Compras
create table if not exists compras (
  id bigint generated always as identity primary key,
  conta_id bigint not null references contas(id) on delete cascade,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Itens de cada compra
create table if not exists itens_compra (
  id bigint generated always as identity primary key,
  compra_id bigint not null references compras(id) on delete cascade,
  produto_id bigint references produtos(id) on delete set null,
  descricao text not null,
  imagem_url text,
  preco_unitario numeric(10, 2) not null default 0,
  quantidade integer not null default 1,
  emoji_indice integer
);

-- Fechamentos (uma linha por conta)
create table if not exists fechamentos (
  id bigint generated always as identity primary key,
  conta_id bigint not null unique references contas(id) on delete cascade,
  valor_pago numeric(10, 2) not null default 0,
  observacao text,
  atualizado_em timestamptz not null default now()
);

-- Usuários do sistema (login simples, feito por fora do Supabase Auth)
create table if not exists usuarios (
  id bigint generated always as identity primary key,
  nome text not null unique,
  senha text not null,
  created_at timestamptz not null default now()
);

-- Usuário padrão para o primeiro acesso

-- ============================================================
-- Função de login
--
-- A verificação de usuário/senha roda dentro do banco (não no
-- front-end), para não precisar expor a coluna "senha" da tabela
-- "usuarios" via a chave anônima do Supabase.
-- ============================================================
create or replace function public.login(p_nome text, p_senha text)
returns table (id bigint, nome text)
language sql
security definer
set search_path = public
as $$
  select id, nome
  from usuarios
  where nome = p_nome
    and senha = p_senha;
$$;

grant execute on function public.login(text, text) to anon, authenticated;

-- ============================================================
-- Row Level Security
--
-- Este é um sistema interno (uso da equipe da cantina). As políticas
-- abaixo liberam leitura/escrita nas tabelas de dados para quem usa
-- a chave "anon" do Supabase — suficiente para um app simples como
-- este, sem tela de cadastro pública.
--
-- Se no futuro o sistema crescer (mais gente com acesso, dados mais
-- sensíveis), o ideal é migrar o login para o Supabase Auth e trocar
-- "using (true)" por uma checagem de usuário autenticado.
-- ============================================================
alter table produtos enable row level security;
alter table contas enable row level security;
alter table compras enable row level security;
alter table itens_compra enable row level security;
alter table fechamentos enable row level security;
alter table usuarios enable row level security;

create policy "produtos: acesso total" on produtos for all using (true) with check (true);
create policy "contas: acesso total" on contas for all using (true) with check (true);
create policy "compras: acesso total" on compras for all using (true) with check (true);
create policy "itens_compra: acesso total" on itens_compra for all using (true) with check (true);
create policy "fechamentos: acesso total" on fechamentos for all using (true) with check (true);

-- Repare que "usuarios" NÃO recebe nenhuma política de select/insert/
-- update/delete para o anon — a única forma de consultá-la é pela
-- função login() acima, que roda com privilégios elevados
-- ("security definer") só para checar usuário e senha.

-- ============================================================
-- Migração (rode isto se você já criou as tabelas antes desta
-- atualização — o "create table if not exists" acima não adiciona
-- colunas novas em tabelas que já existem)
-- ============================================================
alter table produtos add column if not exists emoji_indice integer;
alter table itens_compra add column if not exists emoji_indice integer;

-- ============================================================
-- Índices úteis
-- ============================================================
create index if not exists idx_produtos_ano on produtos(ano);
create index if not exists idx_contas_ano on contas(ano);
create index if not exists idx_compras_conta_id on compras(conta_id);
create index if not exists idx_itens_compra_compra_id on itens_compra(compra_id);
