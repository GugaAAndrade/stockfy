import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/cadastro", "/api/auth", "/_next", "/favicon.ico"]; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  const session = request.cookies.get("stockfy_session");
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
