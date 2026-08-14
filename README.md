# Tela de Produtos — React + Material UI

Protótipo funcional da tela de cadastro de produtos.

## Requisitos

- Node.js 20+ recomendado
- npm

## Instalação

```bash
npm install
npm run dev
```

Depois acesse a URL exibida pelo Vite, normalmente:

http://localhost:5173

## Funcionalidades

- Listagem de produtos
- Filtro por ano
- Busca por ID ou descrição
- Paginação
- Cadastro
- Edição
- Exclusão
- Upload/preview de imagem
- Layout responsivo para celular
- Dados separados por ano

## Observação

Neste primeiro estágio os dados ficam em memória. Ao recarregar a página, os dados retornam ao estado inicial.

A próxima etapa pode substituir `src/data/products.ts` por uma API NestJS e PostgreSQL/Supabase.