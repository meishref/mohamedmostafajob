import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_PROXY_URL?.replace(/\/$/, "");

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const STRIPPED_RESPONSE_HEADERS = new Set(["content-encoding", "content-length"]);

function resolveFrontendOrigin(request: NextRequest): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return null;
  }

  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "") ??
    "http";

  return `${proto}://${host.split(",")[0].trim()}`;
}

function buildBackendUrl(path: string, search: string): URL {
  if (!backendBaseUrl) {
    throw new Error("BACKEND_PROXY_URL is not configured.");
  }

  return new URL(`${path}${search}`, backendBaseUrl);
}

function forwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });

  const host = request.headers.get("host");
  if (host) {
    headers.set("X-Forwarded-Host", host);
  }

  headers.set("X-Forwarded-Proto", request.nextUrl.protocol.replace(":", ""));

  const frontendOrigin = resolveFrontendOrigin(request);
  if (frontendOrigin) {
    if (!headers.has("origin")) {
      headers.set("Origin", frontendOrigin);
    }
    if (!headers.has("referer")) {
      headers.set("Referer", `${frontendOrigin}/`);
    }
  }

  if (backendBaseUrl?.includes("ngrok")) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  return headers;
}

/** Remove Domain= so cookies apply to the frontend host, not the backend host. */
function sanitizeSetCookie(cookie: string): string {
  return cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => !part.toLowerCase().startsWith("domain="))
    .join("; ");
}

function collectSetCookies(response: Response): string[] {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

function buildResponseHeaders(backendResponse: Response): Headers {
  const headers = new Headers();

  backendResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || STRIPPED_RESPONSE_HEADERS.has(lower)) {
      return;
    }
    headers.set(key, value);
  });

  for (const cookie of collectSetCookies(backendResponse)) {
    headers.append("set-cookie", sanitizeSetCookie(cookie));
  }

  return headers;
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  if (!backendBaseUrl) {
    return NextResponse.json(
      {
        success: false,
        message:
          "BACKEND_PROXY_URL is not set. Add it to frontend/.env.local and restart the frontend.",
      },
      { status: 502 },
    );
  }

  let backendUrl: URL;
  try {
    backendUrl = buildBackendUrl(backendPath, request.nextUrl.search);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid BACKEND_PROXY_URL." },
      { status: 502 },
    );
  }

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method,
      headers: forwardRequestHeaders(request),
      body,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: `Could not reach backend at ${backendBaseUrl}. Is the backend running on port 8000?`,
      },
      { status: 502 },
    );
  }

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: buildResponseHeaders(backendResponse),
  });
}

export function proxyRouteHandlers(backendPathPrefix: string) {
  async function handler(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> },
  ): Promise<NextResponse> {
    const { path } = await context.params;
    const suffix = path.length > 0 ? `/${path.join("/")}` : "";
    return proxyToBackend(request, `${backendPathPrefix}${suffix}`);
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
    OPTIONS: handler,
  };
}
