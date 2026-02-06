import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/entrar",
  "/login",
  "/cadastro",
  "/empresa",
  "/",
  "/planos",
  "/assinatura",
  "/convite",
  "/api/invites",
  "/api/auth",
  "/api/tenants",
  "/api/billing/webhook",
  "/_next",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  if (pathname === "/app" || pathname === "/app/") {
    const loginUrl = new URL("/entrar", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const session = request.cookies.get("stockfy_session");
  if (!session) {
    const loginUrl = new URL("/entrar", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
