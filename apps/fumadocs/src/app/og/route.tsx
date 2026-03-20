// app/og/route.ts  ← single route, no [...slug]
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Dokumentasi Tanisya.com";
  const description = searchParams.get("description") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          padding: "60px",
          background: "#0f172a",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 18, color: "#94a3b8", marginBottom: 16 }}>
          Dokumentasi Tanisya.com
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 16 }}>
            {description}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}