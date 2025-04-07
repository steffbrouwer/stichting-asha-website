import './globals.css';
import type { Metadata } from 'next';
import { Poppins, Roboto } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins'
});

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto'
});

export const metadata: Metadata = {
  title: 'Stichting Asha',
  description: 'Stichting Asha - Hoop in het Hindi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${poppins.variable} ${roboto.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}