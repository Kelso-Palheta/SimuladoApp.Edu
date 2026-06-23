"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

const MODULOS_PADRAO = ["diario-planejamento", "gerador-atividades", "redacao-corretor", "agente-linguagens"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, "professores", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPerfil(snap.data());
        } else {
          const novo = {
            nome: firebaseUser.displayName || "",
            email: firebaseUser.email,
            modulos_permitidos: MODULOS_PADRAO,
          };
          await setDoc(ref, novo);
          setPerfil(novo);
        }
      } else {
        setPerfil(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no Google Login:", error);
      throw error;
    }
  };

  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const cadastrarEmail = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const novo = {
      nome: email.split("@")[0],
      email,
      modulos_permitidos: MODULOS_PADRAO,
    };
    await setDoc(doc(db, "professores", cred.user.uid), novo);
  };

  const recuperarSenha = (email) => sendPasswordResetEmail(auth, email);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("diario_bimestre");
      localStorage.removeItem("atividades_bimestre");
    }
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, perfil, loading, loginGoogle, loginEmail, cadastrarEmail, recuperarSenha, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}
