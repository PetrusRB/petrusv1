import './global.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
