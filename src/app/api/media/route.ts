import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = [".supabase.co"];

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return ALLOWED_HOSTS.some((host) =>
      host.startsWith(".") ? url.hostname.endsWith(host) : url.hostname === host,
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src || !isAllowedUrl(src)) {
    return NextResponse.json({ error: "URL no permitida" }, { status: 400 });
  }

  const upstream = await fetch(src, { cache: "force-cache" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "No se pudo cargar la imagen" }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("Content-Type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
