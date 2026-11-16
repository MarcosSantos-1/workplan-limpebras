# Deploy — WorkPlan

## 1. Firebase (uma vez)

1. **Authentication → Sign-in method**: deixe **E-mail/senha** ativado.
2. **Authentication → Settings → Authorized domains**: adicione o domínio da Vercel
   (ex.: `workplan-limpebras.vercel.app`). Sem isso o e-mail de "Esqueci minha senha" sai sem o botão de voltar ao site.
3. **Authentication → Templates → Password reset**: troque o idioma do modelo para Português (opcional).
4. **Firestore Database → Rules**: cole o conteúdo de [`firestore.rules`](firestore.rules) e clique em **Publicar**.
   Sempre que esse arquivo mudar, publique de novo.

### Primeiro administrador
Com as regras publicadas, entre no site com a sua conta. A tela "Acesso não liberado" mostra o botão
**Tornar-me administrador** — isso só funciona uma vez (cria `config/bootstrap`). Depois disso, os acessos são
liberados pela página **Acessos**.

## 2. Vercel

1. Em <https://vercel.com/new>, importe o repositório `workplan-limpebras` do GitHub. O framework (Next.js) é detectado sozinho.
2. Antes de clicar em **Deploy**, abra **Environment Variables** e cadastre as 6 variáveis do `.env.local`
   (os nomes estão em [`.env.example`](.env.example)):

   | Nome | Onde achar o valor |
   |---|---|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase → Configurações do projeto → Seus apps → `apiKey` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

   **Atalho:** copie o conteúdo inteiro do `.env.local` e cole no primeiro campo "Key" — a Vercel separa as 6 variáveis sozinha.
   Deixe marcados os ambientes **Production**, **Preview** e **Development**.
3. Clique em **Deploy**. A cada `git push` na `master` a Vercel publica de novo.

> Variáveis `NEXT_PUBLIC_*` entram no código **na hora do build**. Se você mudar alguma depois, vá em
> **Deployments → ⋯ → Redeploy** para valer.

### Pela linha de comando (alternativa)

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production   # repita para cada variável/ambiente
vercel --prod
```

Para baixar as variáveis da Vercel para o seu PC: `vercel env pull .env.local`.
