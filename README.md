# WorkPlan — Limpebras Lote III

Gerador de cronogramas + plano de trabalho online. Protótipo com o serviço **GO (Cata-bagulho)**.

Next.js 16 · React 19 · Tailwind v4 · Firebase (Auth + Firestore) · ExcelJS · ADC Design Kit.

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

As chaves do Firebase ficam em `.env.local` (modelo em `.env.example`).

### Firebase (uma vez)
1. **Authentication → E-mail/senha**: ative e crie os usuários (não há cadastro pelo site).
2. **Firestore Database**: crie o banco e cole as regras de `firestore.rules`
   (ou `firebase deploy --only firestore:rules`).

## Como o cronograma funciona

Mapa `CV10500GO0001` = sub `CV` · turno `1` · frequência `0500` · serviço `GO` · nº `0001`.

- O GO roda num **ciclo de 12 posições**. Cada dia operado executa a próxima posição, nas 4 subs ao mesmo tempo.
- Posição *k*: CV/JT/MG → 1º turno mapa `2k−1`, 2º turno mapa `2k`.
  ST → 1º turno equipes A/B mapas `2k−1` e `2k`, 2º turno mapa `k`.
- **Continuidade**: o ciclo nunca reinicia. Um cronograma novo começa na posição seguinte à última
  executada antes da data início (ex.: 16/11/2026 = posição 7 → 17/11/2026 começa na posição 8, `ST20500GO0008`).
- A linha do tempo vigente = cronograma antigo (seg–sáb, recriado pela regra) + cronogramas **publicados**;
  o publicado vale a partir da sua data início.
- Pula feriados nacionais, o estadual (09/07) e os municipais de SP (25/01, Sexta-feira Santa, Corpus Christi).
  Pontos facultativos (Carnaval, Cinzas, 24/12, 31/12) só são pulados se marcados.

Código do motor: `lib/plano/` (`motor.ts`, `feriados.ts`, `servicos.ts`).

## Validações

```bash
npm run validar:legado   # recria a planilha docs/cronogramas/GO.xlsx pela regra: 4.167 datas, 0 divergências
npm run validar:excel    # exporta e compara a aba CRONOGRAMA com o layout original
```

## Firestore — coleção `cronogramas`

Um documento por cronograma: parâmetros, `dias` (`[{data, slot}]`), `mapas` (`{código: [datas]}`),
`pulados`, `continuidade`, `status` (`rascunho` | `publicado` | `arquivado`), autor e datas.
O campo `mapas` já está no formato para outros sistemas consumirem.
