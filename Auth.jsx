import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("Entre ton email et ton mot de passe.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setInfo("Compte créé. Vérifie ta boîte mail pour confirmer ton inscription, puis connecte-toi.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Mon budget</h1>
        <p className="auth-sub">
          {mode === "login" ? "Connecte-toi à ton compte" : "Crée ton compte client"}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" />

          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Chargement…" : mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
            setInfo("");
          }}
        >
          {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
