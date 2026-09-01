import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth.jsx";
import Dashboard from "./Dashboard.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="loading">Chargement…</div>;

  return session ? <Dashboard session={session} /> : <Auth />;
}
