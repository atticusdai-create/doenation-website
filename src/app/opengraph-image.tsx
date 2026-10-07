import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "DoeNation: a safe place to begin again. A guest house in Aurora, Colorado.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read at module level (as in the Next.js docs) so the image is generated once at build time.
const font = await readFile(join(process.cwd(), "assets/Lexend-SemiBold.ttf"));
const eggSrc = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/images/egg-mark.png"))).toString("base64")}`;

export default async function Image() {

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#5b2e91",
          color: "#fbf9ff",
          fontFamily: "Lexend",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={eggSrc} width={72} height={72} alt="" style={{ borderRadius: 999, background: "#ffffff" }} />
          <div style={{ fontSize: 40, letterSpacing: "-0.02em" }}>DoeNation</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 720 }}>
            A safe place to begin again.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#e3d6f5" }}>A guest house in Aurora, Colorado</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Lexend", data: font, style: "normal", weight: 600 }] },
  );
}
