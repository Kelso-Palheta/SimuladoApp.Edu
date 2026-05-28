'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verifica se tem o novo sistema de auth (prof_user com dados do cadastro)
    const user = localStorage.getItem('prof_user');
    
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed && parsed.email) {
          setIsAuthenticated(true);
          if (pathname === '/professor/login') {
            router.push('/professor');
          }
          return;
        }
      } catch {}
    }
    
    // Se não tiver dados válidos, limpa tudo e manda pro login
    localStorage.removeItem('prof_auth');
    localStorage.removeItem('prof_user');
    setIsAuthenticated(false);
    
    if (pathname !== '/professor/login') {
      router.push('/professor/login');
    }
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={32} />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/professor/login') {
    return null;
  }

  return <>{children}</>;
}
