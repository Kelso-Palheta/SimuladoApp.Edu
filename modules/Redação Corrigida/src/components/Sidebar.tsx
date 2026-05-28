'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  History, 
  BookOpen, 
  Zap,
  LayoutDashboard,
  User,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('prof_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || '');
      }
    } catch {}
  }, [pathname]);

  // Rotas onde a barra lateral NÃO deve aparecer
  const hideSidebarRoutes = ['/', '/professor/login', '/aluno'];
  
  if (hideSidebarRoutes.includes(pathname)) {
    return null;
  }

  const menuItems = [
    { name: 'Nova Correção', icon: History, href: '/professor?new=1' },
    { name: 'Minhas Correções', icon: LayoutDashboard, href: '/professor/desempenho' },
    { name: 'Critérios Inep', icon: BookOpen, href: '/criterios' },
  ];

  const isStudent = pathname.startsWith('/aluno');
  const isProfessor = pathname.startsWith('/professor');

  const handleLogout = () => {
    localStorage.removeItem('prof_auth');
    localStorage.removeItem('prof_user');
    router.push('/');
  };

  return (
    <aside className="hidden w-80 lg:flex flex-col border-r border-white/10 bg-neutral-900/40 backdrop-blur-xl h-screen sticky top-0">
      <div className="p-8 border-b border-white/10">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="text-violet-400 fill-violet-400/20" size={24} />
            Redação AI
          </h1>
        </Link>
        <p className="text-neutral-500 text-xs mt-1 font-medium tracking-wide uppercase">
          {isStudent ? 'Portal do Aluno' : 'Assistant Pro'}
        </p>
      </div>

      {/* Nome do professor logado */}
      {isProfessor && userName && (
        <div className="px-8 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500/30">
              <User size={16} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Professor</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 space-y-2">
        {!isStudent ? (
          menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all font-medium text-sm ${
                pathname === item.href 
                  ? 'text-violet-400 bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] border border-white/5' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))
        ) : (
          <Link 
            href="/aluno"
            className="flex items-center gap-3 w-full p-4 rounded-xl text-violet-400 bg-white/5 font-medium text-sm"
          >
            <History size={18} />
            <span>Minhas Redações</span>
          </Link>
        )}
      </div>

      <div className="p-6 border-t border-white/10">
        {isProfessor ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-neutral-400 hover:text-red-400 font-bold justify-center border border-white/5"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair da Conta</span>
          </button>
        ) : isStudent ? (
          <Link 
            href="/"
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-neutral-400 hover:text-white font-bold justify-center border border-white/5"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair do Portal</span>
          </Link>
        ) : (
          <Link 
            href="/professor/login"
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-violet-600 hover:bg-violet-500 transition-all text-white font-bold shadow-lg shadow-violet-500/20 justify-center"
          >
            <User size={18} />
            <span className="text-sm">Login Professor</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
