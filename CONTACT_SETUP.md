# Contact Form Setup (Resend)

## 1. Install

```bash
npm install resend
```

## 2. Environment variables

Add these to **`.env.local`** (create it in the project root if it doesn’t exist).  
**Do not commit `.env.local`** (it should be in `.gitignore`).

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | From [Resend → API Keys](https://resend.com/api-keys). |
| `CONTACT_TO_EMAIL` | Your inbox (e.g. `laflammedaisy@gmail.com`). |
| `CONTACT_FROM_EMAIL` | Verified sender in Resend, or **`onboarding@resend.dev`** for testing only. |

See `.env.local.example` for a copy-paste template.

## 3. Test locally

1. Run `npm run dev`.
2. Open [http://localhost:3000/contact](http://localhost:3000/contact).
3. Submit the form. Check your inbox (and Resend dashboard) for the email.
4. If using `onboarding@resend.dev`, you can only send to the email you signed up with on Resend.

## 4. Deploy on Vercel

1. Push your repo; Vercel will build and deploy.
2. In Vercel: **Project → Settings → Environment Variables**.
3. Add:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
4. Redeploy so the new env vars are applied.

## Checklist for Vercel deployment

- [ ] `resend` is in `package.json` (after `npm install resend`).
- [ ] `.env.local` is **not** committed (only used locally).
- [ ] In Vercel, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` are set.
- [ ] For production, `CONTACT_FROM_EMAIL` is a verified domain in Resend (not `onboarding@resend.dev`).
- [ ] After adding/changing env vars in Vercel, trigger a new deployment.

## 500 error in production (Vercel)

If the form shows "Failed to send message" and the Network tab shows **500** for `POST /api/contact`:

1. **Check environment variables**
   - Vercel → your project → **Settings** → **Environment Variables**.
   - Ensure **Production** (and **Preview** if you test preview URLs) has:
     - `RESEND_API_KEY` (starts with `re_`; from [Resend API Keys](https://resend.com/api-keys)).
     - `CONTACT_TO_EMAIL` (e.g. `laflammedaisy@gmail.com`).
     - `CONTACT_FROM_EMAIL` (verified domain in Resend, or `onboarding@resend.dev` for testing).
   - No typos, no extra spaces. Values are **not** quoted in Vercel.

2. **Redeploy after adding/changing vars**
   - Env vars are baked in at deploy time. After saving them, run **Deployments** → open the latest deployment → **Redeploy**, or push a new commit.

3. **Check Vercel function logs**
   - Vercel → **Deployments** → latest deployment → **Functions** (or **Logs**).
   - Submit the form again, then look at the logs for the `/api/contact` request.
   - You may see: `Contact API: Missing env vars on Vercel: RESEND_API_KEY, ...` (add those in Settings).
   - Or: `Contact API Resend error: {...}` (e.g. invalid API key, or `CONTACT_FROM_EMAIL` not verified for your domain).

4. **Resend limits**
   - With the free tier and `onboarding@resend.dev`, you can only send **to** the email address of your Resend account. For production, add and verify your own domain in Resend and set `CONTACT_FROM_EMAIL` to an address on that domain.
