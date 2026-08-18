import type { Metadata, Viewport } from "next";
import {
  Allura,
  Cormorant_Garamond,
  Dancing_Script,
  Noto_Sans_Hebrew,
  Noto_Serif_Hebrew,
} from "next/font/google";
import "./globals.css";

const bodyFont = Noto_Sans_Hebrew({
  variable: "--font-body",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

const displayFont = Noto_Serif_Hebrew({
  variable: "--font-display",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

const murrayHillFont = Dancing_Script({
  variable: "--font-murray-hill",
  subsets: ["latin"],
  display: "swap",
});

const openingScriptFont = Allura({
  variable: "--font-opening-script",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

const openingSerifFont = Cormorant_Garamond({
  variable: "--font-opening-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Clara & David — Notre mariage",
    template: "%s — Clara & David",
  },
  description:
    "L’invitation au mariage de Clara et David, à découvrir en français et en hébreu.",
  applicationName: "Clara & David",
  category: "wedding",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8F4EC",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${bodyFont.variable} ${displayFont.variable} ${murrayHillFont.variable} ${openingScriptFont.variable} ${openingSerifFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
