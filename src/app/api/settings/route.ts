import { NextResponse } from "next/server";
import { getPublicSettings } from "@/server/publicSettings";

export async function GET() {
  return NextResponse.json(getPublicSettings());
}
