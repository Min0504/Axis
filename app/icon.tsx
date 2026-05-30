import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Brand favicon ("a." on a dark rounded square) generated at build time,
// so no binary asset needs to live in the repo.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 7
        }}
      >
        a.
      </div>
    ),
    size
  );
}
