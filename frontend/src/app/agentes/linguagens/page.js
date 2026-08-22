'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Rota legacy — redirecionada para o Hub de Agentes Pedagógicos
export default function AgenteLinguagensPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/agentes'); }, [router]);
  return null;
}
