import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SliceFix AI - Admin Portal',
  description: 'Administrative portal for SliceFix AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background-primary">
        {children}
      </body>
    </html>
  );
}
