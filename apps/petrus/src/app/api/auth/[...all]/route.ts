import arcjet, { detectBot, fixedWindow } from '@/lib/arcjet';
import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import {
  type ArcjetDecision,
  type BotOptions,
  type EmailOptions,
  EmailOptionsDeny,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  protectSignup,
  slidingWindow,
} from '@arcjet/next';
import { clerkClient } from '@/lib/clerk';

// Opções
const emailOptions = {
  mode: 'LIVE',
  deny: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
} satisfies EmailOptions;

const botOptions = {
  mode: 'LIVE',
  allow: [],
} satisfies BotOptions;

const rateLimitOptions = {
  mode: 'LIVE',
  interval: '2m',
  max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
  email: {
    mode: 'LIVE',
    deny: emailOptions.deny,
  } as EmailOptionsDeny,
  bots: botOptions,
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

const aj = arcjet
  .withRule(
    detectBot({
      mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
      // configured with a list of bots to allow from
      // https://arcjet.com/bot-list
      allow: [], // blocks all automated clients
    })
  )
  // You can chain multiple rules, so we'll include a rate limit
  .withRule(
    fixedWindow({
      mode: 'LIVE',
      max: 100,
      window: '60s',
    })
  );

async function protect(req: NextRequest): Promise<ArcjetDecision> {
  if (req.nextUrl.pathname.startsWith('/api/auth/sign-up')) {
    const body = await req
      .clone()
      .json()
      .catch(() => null);

    if (body && typeof body.email === 'string') {
      return aj
        .withRule(protectSignup(signupOptions))
        .protect(req, { email: body.email });
    }

    return aj.withRule(slidingWindow(rateLimitOptions)).protect(req);
  }

  return aj.protect(req);
}

/**
 * Rota GET
 * @param req
 * @returns usuário atual autenticado
 */
export async function GET(req: NextRequest) {
  const { userId, sessionId } = getAuth(req);

  const user = userId
    ? await clerkClient.users.getUser(userId).catch(() => null)
    : null;

  return Response.json({ userId, sessionId, user }, { status: 200 });
}

/**
 * Rota POST
 * @param req
 * @returns mensagem de sucesso caso o request for válido
 */
export const POST = async (req: NextRequest) => {
  const decision = await protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    }

    if (decision.reason.isEmail()) {
      let message = 'Email inválido';

      if (decision.reason.emailTypes.includes('INVALID')) {
        message = 'Email de endereço inválido';
      } else if (decision.reason.emailTypes.includes('DISPOSABLE')) {
        message = 'Não permitimos endereços de e-mail descartáveis.';
      } else if (decision.reason.emailTypes.includes('NO_MX_RECORDS')) {
        message =
          'O seu domínio de e-mail não possui um registro MX. Existe algum erro de digitação?';
      }

      return Response.json({ message }, { status: 400 });
    }

    return new Response(null, { status: 403 });
  }

  return Response.json({ ok: true }, { status: 200 });
};
