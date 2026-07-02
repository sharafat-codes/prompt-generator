import { ImageResponse } from "next/og";

export const alt = "PromptPilot — Prompts that compound";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBFAF7",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 16,
              background: "#1F6F5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            {">"}
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#1B1E1C" }}>
            PromptPilot
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 86,
              fontWeight: 800,
              color: "#1B1E1C",
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            <span style={{ display: "flex" }}>Prompts that</span>
            <span style={{ display: "flex", color: "#1F6F5C", marginLeft: 22 }}>compound.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: "#565C57" }}>
            <span style={{ display: "flex" }}>Chat in, recipe out —</span>
            <span
              style={{
                display: "flex",
                background: "#E4F0EB",
                border: "2px solid #BAD5CA",
                borderRadius: 10,
                padding: "4px 16px",
                color: "#185A4A",
                fontSize: 28,
              }}
            >
              {"{product}"}
            </span>
            <span style={{ display: "flex" }}>reuse forever.</span>
          </div>
        </div>

        {/* footer line */}
        <div style={{ display: "flex", fontSize: 25, color: "#8B8F89" }}>
          The AI prompt workspace · content &amp; prompts, saved as reusable recipes.
        </div>
      </div>
    ),
    { ...size },
  );
}
