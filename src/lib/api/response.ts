import { NextResponse } from "next/server";

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: ApiError, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}
