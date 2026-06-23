"use client";

import { Suspense } from 'react';
import AtividadeContent from './AtividadeContent';

export default function AtividadeAlunoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    }>
      <AtividadeContent />
    </Suspense>
  );
}
