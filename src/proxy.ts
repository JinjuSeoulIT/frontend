import { NextResponse } from "next/server";

// Authentication guard is handled in the client layer
// (MainLayout bootstrap + axios interceptor).
// Keep proxy as pass-through to avoid host-dependent cookie checks.
export async function proxy() {
  return NextResponse.next();
}
