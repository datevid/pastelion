import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/react';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "Pastelion - Secure Code Sharing",
  description: "Share your code and text securely with end-to-end encryption aesthetics.",
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="w-full">
            {children}
          </div>
          <Toaster position="bottom-right" />
          <Analytics />
        </ThemeProvider>
      </body>

    </html>
  );
}
