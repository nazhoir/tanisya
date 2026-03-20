import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

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
          {page.data.title}
        </div>
        {page.data.description && (
          <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 16 }}>
            {page.data.description}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}