import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso livre à rota de autenticação
  if (pathname.startsWith("/authentication")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  // Se não estiver autenticado, redireciona
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/patients",
    "/doctors",
    "/appointments",
    "/subscription",
  ],
};
