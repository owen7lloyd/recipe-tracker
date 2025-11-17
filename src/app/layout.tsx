import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recipe & Pantry Tracker',
  description: 'Manage your recipes, pantry, and grocery lists',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
