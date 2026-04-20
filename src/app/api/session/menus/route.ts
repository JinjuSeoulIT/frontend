import { NextResponse } from "next/server";
import { fetchServerMenus } from "@/lib/admin/menuServer";

export async function GET() {
  const menus = await fetchServerMenus();

  return NextResponse.json({
    menus,
  });
}
