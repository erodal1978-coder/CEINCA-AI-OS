import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontFamily = "Montserrat";

await Promise.all(
  (["600", "700", "800", "900"] as const).map((weight) =>
    loadFont({
      family: fontFamily,
      url: staticFile(`fonts/Montserrat-${weight}.woff2`),
      weight,
    }),
  ),
);

export const colors = {
  navy: "#0B1D3A",
  navyMid: "#132848",
  navyLight: "#1A3560",
  gold: "#C8A951",
  goldDark: "#A8892E",
  goldLight: "#DDB96A",
  white: "#FFFFFF",
  cream: "#FAF6ED",
} as const;

export const gradients = {
  hero: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
  gold: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 50%, ${colors.goldDark} 100%)`,
} as const;
