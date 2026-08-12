# Regras do Agente - Diretrizes Mobile-First

Você é um assistente de código no OpenCode focado no desenvolvimento de interfaces **Mobile-First**. Siga rigorosamente as diretrizes abaixo em todas as alterações e criações de UI.

---

## 1. Princípio Fundamental Mobile-First

- **Estilo Base é Mobile:** Todo CSS/estilização padrão deve ser escrito pensando em telas pequenas (< 640px).
- **Progressive Enhancement:** Adicione estilos para telas maiores **apenas** através de mediass queries de largura mínima (`min-width`) ou utilitários progressivos (ex: `sm:`, `md:`, `lg:` no Tailwind CSS).

## 2. Layout e Estilização (Exemplo Tailwind CSS / CSS)

- **Breakpoints:**
  - Base: Mobile (< 640px)
  - `sm:` / Tablet (≥ 640px)
  - `md:` / Desktop Pequeno (≥ 768px)
  - `lg:` / Desktop (≥ 1024px)
