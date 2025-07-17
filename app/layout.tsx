import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster as SonnerToaster } from "@/components/ui/sonner" // Using sonner for toasts

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Complaint Box',
  description: 'Submit your concerns securely and efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* This new line adds your custom SVG logo */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        {children}
        <SonnerToaster />
      </body>
    </html>
  );
}