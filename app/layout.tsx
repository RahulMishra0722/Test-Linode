import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter, Press_Start_2P } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start',
});
export const metadata: Metadata = {
  title: "Top 10 Game Rankings",
  description: "Rank your favorite games on stream!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${pressStart2P.variable} font-sans antialiased text-foreground bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
