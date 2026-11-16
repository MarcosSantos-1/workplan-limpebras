# ADC Design Kit — identidade visual do ADC Control

Pacote para criar um sistema novo com a mesma cara do ADC Control (Limpebras): tema claro/escuro, sidebar, cards, tabelas, botões, badges, diálogos, gráficos, logotipos e fonte.

Referências visuais: **Dashboard** (`/`), **IPT › Bateria › Trocas de Bateria** e **Indicadores › Explicação** (`/indicadores/explicacao`). Os prints foram tirados em 1920 px nos dois temas.

---

## 1. O que tem aqui

```
adc-design-kit/
├── README.md                ← este guia
├── tokens.json              ← cores, raios, status, botões, gradientes (para usar fora do Tailwind)
├── prints/                  ← telas de referência (claro e escuro)
├── assets/
│   ├── logos/               ← logotipo azul (fundo claro), branco (fundo escuro), favicon
│   ├── backgrounds/         ← wallpapers da tela de login
│   └── loading-lottie.json  ← animação de carregamento
└── codigo/                  ← código pronto (mesmos caminhos de um projeto Next.js)
    ├── app/globals.css      ← TODOS os tokens de tema + grade de fundo + animações
    ├── app/layout.tsx       ← fonte Plus Jakarta Sans + ThemeProvider
    ├── components/ui/*      ← Card, Button, Badge, Table, Tabs, Select, Input, Checkbox, Switch, MultiSelect, DatePicker…
    ├── components/layout/   ← MainLayout (casca da página) e Sidebar
    ├── components/design/
    │   ├── bateria-ui.tsx   ← botões BTN_*, GLASS_CARD, InfoTooltip, SortToggle, badges de status
    │   └── receitas.tsx     ← blocos prontos: heros, KPIs, ranking, diagnóstico, listagem, fórmulas
    ├── components/motion-ui/ + motion-primitives/  ← diálogo animado, menu do usuário, efeitos
    ├── components/exemplos/ ← gráficos (Chart.js) já com cores por tema
    ├── components/theme-provider.tsx, theme-toggle.tsx
    ├── hooks/, lib/utils.ts (cn)
    ├── postcss.config.mjs
    └── dependencias.txt     ← versões exatas das libs
```

## 2. Stack

| Item | Versão / uso |
|---|---|
| Next.js | 16 (App Router) |
| React | 19 |
| Tailwind CSS | **v4** (`@import "tailwindcss"`, tokens em `@theme inline`, sem `tailwind.config`) |
| Componentes | estilo shadcn/ui sobre Radix (`@radix-ui/react-*`), `class-variance-authority`, `tailwind-merge` |
| Ícones | `lucide-react` (traço 1.5–2, tamanhos 14–20 px; 36–44 px em heros) |
| Tema | `next-themes` — classe `.dark` no `<html>` |
| Animação | `motion` (ex-framer-motion) |
| Gráficos | `chart.js` + `react-chartjs-2` (principal), `recharts` (alguns) |
| Toasts | `react-toastify` |
| Datas | `date-fns` + `react-day-picker` (locale `ptBR`) |

## 3. Como começar um projeto novo

1. `npx create-next-app@latest` (TypeScript, App Router, Tailwind).
2. Instale as libs de `codigo/dependencias.txt`, por exemplo: `npm i next-themes lucide-react motion class-variance-authority clsx tailwind-merge @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-popover chart.js react-chartjs-2 react-toastify date-fns react-day-picker`.
3. Copie a pasta `codigo/` por cima do projeto (`app/globals.css`, `components/`, `hooks/`, `lib/`).
4. Em `app/layout.tsx`, mantenha a fonte e o `ThemeProvider`. Remova o `AuthProvider`, os toasts de boas-vindas e o SpeedInsights, que são específicos do ADC.
5. Copie `assets/logos/*` para `public/` com os nomes `logotipo.png` (azul) e `logotipo-white.png` (branco), que é como a Sidebar os referencia.
6. **Sidebar e MainLayout** usam `useAuth()` e tipos de `@/lib/api` (permissões por página). Troque por sua autenticação, ou remova as checagens e use apenas os arrays de itens de menu.
7. Monte as páginas com `components/design/receitas.tsx` e compare com os prints.

## 4. Tema

Tokens em `app/globals.css` (`:root` = claro, `.dark` = escuro), expostos ao Tailwind via `@theme inline` (`bg-background`, `text-muted-foreground`, `border-border`…).

| Token | Claro | Escuro |
|---|---|---|
| background | `#f8f9fc` | `#09090b` |
| card | `#ffffff` | `#121214` |
| foreground | `#171717` | `#fafafa` |
| muted-foreground | `#71717a` | `#a1a1aa` |
| border | `#e2e8f0` | `#27272a` |
| primary (índigo) | `#4f46e5` | `#818cf8` |
| destructive | `#ef4444` | `#7f1d1d` |

- Alternância: `ThemeToggle` (sol/lua) dentro do menu do usuário na base da sidebar. `storageKey="flip-theme"`, padrão **claro**.
- Fundo da área de conteúdo: `.grid-pattern` (grade de 40 px a 5%). Há também `.aurora-page` (gradientes radiais esmeralda/teal/índigo) para páginas "vidro".
- **Cor de identidade:** verde-esmeralda/teal (Limpebras) para ações e heros. Índigo (primary) fica para foco/anel e destaques do Dashboard.

## 5. Tipografia

Fonte única: **Plus Jakarta Sans** (`next/font/google`, variável `--font-plus-jakarta-sans`). Códigos de setor, módulos e fórmulas usam `font-mono`.

| Uso | Classes |
|---|---|
| Título de hero | `text-4xl font-bold tracking-tight` |
| Subtítulo de hero | `text-lg text-slate-600 dark:text-muted-foreground` (ou `text-emerald-50` em hero verde) |
| Cabeçalho de módulo (sticky) | `text-xl font-bold` + `text-xs text-muted-foreground` |
| Título de card | `CardTitle` (`text-2xl font-semibold`), em cards de seção com ícone 20 px |
| Número gigante (hero) | `text-[clamp(3rem,8vw,4.25rem)] font-bold leading-none tabular-nums` |
| Número de KPI | `text-4xl font-bold tabular-nums` (`font-mono` nos cards sólidos) |
| Rótulo de KPI / sub-card | `text-xs font-medium uppercase tracking-wide` |
| Tabela | `text-sm`; cabeçalho `text-muted-foreground font-medium`; cabeçalho alto `h-16` |
| Micro-rótulo (antes/depois) | `text-[10px] uppercase tracking-wide text-muted-foreground` |

Números sempre com `tabular-nums`.

## 6. Estrutura de página

- **Sidebar** fixa à esquerda: `w-72` (288 px), ou `w-60` em telas até 1440 px. Fundo em gradiente vertical azul→fundo→ciano, `backdrop-blur-sm`, sombra índigo suave.
  - Logo no topo: azul no claro, branco no escuro (`dark:hidden` / `hidden dark:block`).
  - Itens `text-[13px] font-semibold rounded-xl`. O item ativo usa gradiente `from-indigo-600/20 to-cyan-500/20` e borda `indigo-500/35`.
  - Grupos (IPT, FLIP) ficam em caixa `rounded-2xl border bg-background/40`, e cada subitem tem um ponto colorido (cores em `tokens.json › sidebar_pontos`).
  - Na base fica o menu do usuário (avatar, papel, status e alternância de tema).
- **Botão ☰** fixo em `top-3 left-3` recolhe a sidebar.
- **Conteúdo** em `p-6`, `space-y-6` entre seções e `gap-4` entre cards.
- **Cabeçalho de módulo** (Trocas): sticky, `bg-background/95 backdrop-blur-md border-b`, com ícone verde + título + subtítulo e a data "Atualizado" à direita.
- **Abas**: `TabsList` com pílula ativa esmeralda (`[&_[data-active-pill]]:bg-emerald-500`, texto branco) e ícone em cada aba. O seletor de período ("Últimos 30 dias") fica à direita.

## 7. Componentes (ver `receitas.tsx` e `bateria-ui.tsx`)

| Bloco | Onde aparece | Receita |
|---|---|---|
| Hero claro com grade e bolhas | Dashboard | `PageHeroDashboard` |
| Hero verde com ícone em quadrado | Explicação | `PageHeroExplicacao` |
| Hero "total" + 3 sub-cards de vidro | Trocas | `HeroTotal` |
| Card de KPI em gradiente animado (azul/verde/laranja/roxo) | Dashboard | `KpiGradientCard` (precisa de `@keyframes gradient/shimmer`) |
| Card sólido sucesso/falha | Trocas | `StatCardSolid` |
| Card neutro com % e barra | Trocas | `StatCardProgress` |
| Ranking em tabela | Trocas | `RankingCard` |
| Diagnóstico em barras verde/vermelho | Trocas | `DiagnosticoCard` |
| Listagem com filtros e ações | Trocas | `ListagemCard` |
| Linha expandida (mini-cards + histórico) | Trocas | `ExpandedStat`, `HistStat`, `EXPANDED_ROW` |
| Fórmula / Memória / Resultado / Tabela de faixas | Explicação | `FormulaBox`, `MemoriaBox`, `ResultadoBox`, `ScoreTable` |
| Tooltip com quebra de linha | Todas | `InfoTooltip` (portal, fixo no viewport) |
| Cabeçalho ordenável | Tabelas | `SortToggle` (desc → asc → nenhum) |
| Badge de status de bateria | Tabelas/diálogos | `renderBatteryStatus(status)` |
| Badge de status de troca | Histórico | `trocaStatusLabel/Emoji/BadgeClass` |

**Cards de vidro** (`GLASS_CARD`): `border border-border bg-card shadow-lg shadow-zinc-900/[0.06]`, e no escuro `dark:border-white/10 dark:bg-muted/60 dark:shadow-black/40`.

**Botões** (todos com gradiente, sem borda, `font-semibold`, leve zoom no hover):

| Constante | Uso |
|---|---|
| `BTN_EMERALD` | ação principal (Agendar, Salvar) |
| `BTN_SKY` | concluir / registrar |
| `BTN_AMBER` | reagendar / pendente / alerta |
| `BTN_RED` | cancelar / excluir |
| `BTN_CYAN` | estado especial |
| `BTN_SECONDARY` | neutro (Exportar, Selecionar, Cancelar do diálogo) |

Tamanho `h-9` na barra de ações e `h-7` dentro de tabela.

**Diálogos**: `components/motion-ui/motion-dialog` (entrada animada). O conteúdo segue este padrão:
- título com ícone colorido + descrição;
- blocos `rounded-lg border bg-muted/30 p-3` com rótulo `text-xs` e ícone;
- rodapé com `BTN_SECONDARY` (Cancelar) e o botão de ação.

Ver `prints/05-*`.

**Status de bateria**: ALTA verde · REGULAR laranja · BAIXA azul · CRÍTICA vermelho · DESATUALIZADA roxo · SEM LEITURA cinza. Badges usam fundo 15% + texto 600 (400 no escuro) + borda 30%. Ícone Wi-Fi verde/vermelho indica o sinal.

## 8. Gráficos

Chart.js com cores calculadas pelo tema (`useTheme()`):
- grade `rgba(255,255,255,0.1)` no escuro e `rgba(0,0,0,0.1)` no claro;
- ticks com 80% / 70% de opacidade;
- tooltip escuro ou claro conforme o tema;
- barras com `borderRadius: 4–6` e `barPercentage: 0.6`.

Paleta usada: azul `rgb(59,130,246)`, verde `rgb(16,185,129)`, violeta `rgb(139,92,246)`, teal `rgb(20,184,166)`, rosa `rgb(244,63,94)`.

Exemplos completos em `codigo/components/exemplos/` (barras simples, barras horizontais, misto barra+linha com 2 eixos). O título do card do gráfico é colorido (`text-lg font-semibold text-amber-600` etc.) e o seletor de mês (`ChartMonthNav`) fica ao lado.

## 9. Prints

| Arquivo | Conteúdo |
|---|---|
| `01-dashboard-{light,dark}.png` | Dashboard: hero, 4 KPIs em gradiente, anel ADC, grade de gráficos |
| `02-trocas-bateria-{light,dark}.png` | Trocas de Bateria: cabeçalho, abas, hero total, 4 indicadores, ranking, diagnóstico, listagem |
| `03-indicadores-explicacao-{light,dark}.png` | Explicação: hero verde, período, resumo, blocos de fórmula/memória/resultado, tabelas |
| `04-componente-linha-expandida-{light,dark}.png` | Linha de tabela expandida: mini-cards, execução diária, histórico antes/depois |
| `05-componente-dialog-agendar-{light,dark}.png` | Diálogo de ação com cards lado a lado, checkbox destacado e rodapé |
| `06-componente-sidebar-{light,dark}.png` | Sidebar com logo, item ativo, grupo IPT aberto e pontos coloridos |

> Os prints foram gerados por renderização da página (html2canvas). Detalhes como desfoque de fundo (`backdrop-blur`) aparecem levemente diferentes do navegador real.

## 10. Checklist de fidelidade

- [ ] Plus Jakarta Sans carregada e aplicada no `body`.
- [ ] `globals.css` copiado inteiro (tokens, `@custom-variant dark`, `.grid-pattern`, `@keyframes gradient/shimmer`).
- [ ] `ThemeProvider` com `attribute="class"`. Testar claro e escuro.
- [ ] Logos certos por tema na sidebar.
- [ ] Números com `tabular-nums`; códigos com `font-mono`.
- [ ] Ações com `BTN_*`, nunca `bg-primary` puro, para manter o verde Limpebras.
- [ ] Tabelas em moldura `rounded-xl ring-1`, cabeçalho `bg-muted/25` e linhas `border-border/30`.
- [ ] Status sempre como badge (cor + texto), nunca só por cor.
