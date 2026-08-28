import type { Metadata } from "next";
import { Be_Vietnam_Pro, Outfit } from "next/font/google";
import "./globals.css";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Providers } from "@/components/Providers";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DRX Hardware | Showroom Linh Kiện Máy Tính & PC Gaming",
    template: "%s | DRX Hardware",
  },
  description: "Cửa hàng linh kiện máy tính, PC Building và thiết bị công nghệ chính hãng DRX Hardware. Bảo hành 36T 1 đổi 1.",
  icons: {
    icon: [
      { url: "/logo/symbol-white.png", type: "image/png" },
    ],
    shortcut: "/logo/symbol-white.png",
    apple: "/logo/symbol-white.png",
  },
};

import ChatbotWidget from '@/components/ChatbotUI';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/symbol-white.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/symbol-white.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('ods_theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${beVietnamPro.variable} ${outfit.variable} font-sans bg-ods-bg text-ods-textMain antialiased`}
      >
        <Providers>
          <LoaderOverlay />
          {children}
        </Providers>
        <ChatbotWidget />
      </body>
    </html>
  );
}
