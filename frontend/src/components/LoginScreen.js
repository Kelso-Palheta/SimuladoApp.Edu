"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginScreen() {
  const { loginGoogle, loginEmail, cadastrarEmail, recuperarSenha } = useAuth();
  const [modo, setModo] = useState("login"); // "login" | "cadastro" | "recuperar"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);
    try {
      if (modo === "login") {
        await loginEmail(email, senha);
      } else if (modo === "cadastro") {
        await cadastrarEmail(email, senha);
      } else {
        await recuperarSenha(email);
        setSucesso("Email de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada.");
        setEmail("");
      }
    } catch (err) {
      const map = {
        "auth/invalid-credential": "Email ou senha inválidos.",
        "auth/email-already-in-use": "Este email já está cadastrado.",
        "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
        "auth/invalid-email": "Formato de email inválido.",
        "auth/user-not-found": "Nenhum usuário encontrado com este email.",
      };
      setErro(map[err.code] || `Erro: ${err.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, #7c3aed 50%, #2563eb 100%)",
      }}
    >
      <div
        className="glass-panel w-full max-w-md p-8 space-y-6"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            SimuladoApp.Edu
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--foreground)", opacity: 0.6 }}
          >
            Hub Educacional — todas as ferramentas em um só lugar
          </p>
        </div>

        {modo !== "recuperar" && (
          <>
            {/* Google */}
            <button
              type="button"
              onClick={async () => {
                try {
                  setErro("");
                  await loginGoogle();
                } catch (err) {
                  if (err.code === "auth/operation-not-allowed") {
                    setErro("Login com Google desativado no Firebase Console.");
                  } else if (err.code === "auth/popup-closed-by-user") {
                    setErro("O popup foi fechado antes de concluir o login.");
                  } else {
                    setErro(`Erro Google: ${err.message}`);
                  }
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--foreground)", opacity: 0.4 }}
              >
                OU
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
            </div>
          </>
        )}

        {modo === "recuperar" && (
          <div className="text-center space-y-1">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Recuperar Senha
            </h2>
            <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
              Insira seu email para receber um link de redefinição de senha.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--foreground)", opacity: 0.7 }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--glass-border)",
              }}
            />
          </div>

          {modo !== "recuperar" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-medium"
                  style={{ color: "var(--foreground)", opacity: 0.7 }}
                >
                  Senha
                </label>
                {modo === "login" && (
                  <button
                    type="button"
                    onClick={() => { setModo("recuperar"); setErro(""); setSucesso(""); }}
                    className="text-xs font-semibold hover:opacity-80"
                    style={{ color: "var(--primary)" }}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required={modo !== "recuperar"}
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "var(--background)",
                  color: "var(--foreground)",
                  border: "1px solid var(--glass-border)",
                }}
              />
            </div>
          )}

          {erro && (
            <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="text-xs text-green-500 font-medium bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {loading
              ? (modo === "login" ? "Entrando..." : modo === "cadastro" ? "Criando conta..." : "Enviando...")
              : modo === "login"
                ? "Entrar"
                : modo === "cadastro"
                  ? "Criar conta"
                  : "Enviar Link de Recuperação"}
          </button>
        </form>

        {/* Toggle */}
        <p
          className="text-center text-xs"
          style={{ color: "var(--foreground)", opacity: 0.5 }}
        >
          {modo === "recuperar" ? (
            <button
              type="button"
              onClick={() => { setModo("login"); setErro(""); setSucesso(""); }}
              className="font-semibold underline hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              ← Voltar para login
            </button>
          ) : (
            <>
              {modo === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setModo(modo === "login" ? "cadastro" : "login");
                  setErro("");
                  setSucesso("");
                }}
                className="font-semibold underline hover:opacity-80"
                style={{ color: "var(--primary)" }}
              >
                {modo === "login" ? "Cadastre-se" : "Faça login"}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
