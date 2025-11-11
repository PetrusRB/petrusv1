import Header from '@/components/ui/header/navbar';
import '@/assets/global.css';
import { cookies } from 'next/headers';

import GlobalClientWrapper from '@/providers/GlobalClientWrapper';
import { Footer } from '@/components/ui/footer';
export const metadata = {
  title: 'Petrus ',
  description: 'A discord bot.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'light';
  return (
    <html suppressHydrationWarning lang="pt-BR" data-theme={theme}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body>
        <Header />
        {/* Espaço para compensar a navbar fixa */}
        <div className="h-[88px]" aria-hidden="true" />
        <GlobalClientWrapper>{children}</GlobalClientWrapper>
        <Footer />
      </body>
    </html>
  );
}
