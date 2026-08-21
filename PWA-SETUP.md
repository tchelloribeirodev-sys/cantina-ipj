# Instalando como app (PWA)

## O que já foi feito
- `vite.config.ts` — adicionado o plugin `vite-plugin-pwa`, configurado com o manifest do app (nome, cores, ícones) e cache do "app shell" (HTML/JS/CSS), pra abrir mais rápido mesmo com internet ruim. Os dados continuam vindo do Supabase em tempo real — isso não deixa o app funcionar 100% offline, só acelera o carregamento da interface.
- `index.html` — adicionado favicon e o ícone usado pelo iOS ao "Adicionar à Tela de Início".
- `public/` — 5 ícones gerados a partir da logo do sistema:
  - `pwa-192x192.png` e `pwa-512x512.png` — ícone padrão (Android/desktop)
  - `pwa-maskable-512x512.png` — versão com margem de segurança, pro Android recortar em círculo/squircle sem cortar o desenho
  - `apple-touch-icon.png` — ícone usado pelo iOS
  - `favicon-32x32.png` — ícone da aba do navegador

## O que falta você rodar

**1. Instalar o plugin:**
```bash
npm install -D vite-plugin-pwa
```
Não fixei uma versão no `package.json` de propósito — o projeto está no Vite 7 (bem recente), e prefiro que o `npm install` resolva a versão do plugin realmente compatível com ela no momento em que você rodar, em vez de eu arriscar um número que pode já estar desatualizado.

**2. Build e teste:**
```bash
npm run build
npm run preview
```
O service worker só funciona em build de produção (`npm run build` + `preview`, ou já publicado no Vercel) — no `npm run dev` normal ele fica desabilitado por padrão.

**3. Testar a instalação:**
- **Android (Chrome):** abra o site publicado → menu (⋮) → "Instalar app" (ou vai aparecer um banner automático)
- **iPhone (Safari):** abra o site → ícone de compartilhar → "Adicionar à Tela de Início"
- **Desktop (Chrome/Edge):** ícone de instalação (⊕) que aparece na barra de endereço

## Se quiser trocar nome/cor/ícone depois
Tudo fica centralizado no bloco `manifest` dentro de `vite.config.ts` — `name`, `short_name`, `theme_color`, `background_color` e a lista de `icons`. Pra trocar os ícones, é só gerar novos PNGs nos mesmos tamanhos e substituir os arquivos em `public/`.
