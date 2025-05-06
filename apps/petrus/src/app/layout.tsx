import Header from '@/components/ui/header/navbar';
import './global.css';
import Provider from '@/providers/Provider';

export const metadata = {
  title: 'Petrus ',
  description: 'A discord bot.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="pt-BR" data-theme="dark">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body>
        <Header />
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
