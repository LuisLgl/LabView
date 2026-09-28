import type { Metadata } from 'next';
import './globals.css';
import { LabProvider } from '@/context/LabContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ToastContainer from '@/components/ToastContainer';

import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'LabView UFPI - Sistema de Gerenciamento de Laboratórios',
  description: 'Sistema Integrado de Gestão e Controle de Laboratório de Informática - UFPI CSHNB Picos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <LabProvider>
          <AppShell>
            {children}
          </AppShell>
        </LabProvider>
      </body>
    </html>
  );
}
