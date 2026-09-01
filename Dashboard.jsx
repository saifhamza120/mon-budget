import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const CAT_DEP = ["Alimentation", "Transport", "Logement", "Loisirs", "Santé", "Éducation", "Autre"];
const CAT_REV = ["Salaire", "Freelance", "Cadeau", "Remboursement", "Autre"];
const COLORS = ["#2a5d5a", "#c96f4a", "#d4a24c", "#6b8f71", "#8a6fa8", "#4a7a96", "#a85b5b"];

export default function Dashboard({ session }) {
  const user = session.user;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("depense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CAT_DEP[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleTypeChange = (t) => {
    setType(t);
    setCategory(t === "depense" ? CAT_DEP[0] : CAT_REV[0]);
  };

  const addTransaction = async () => {
    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setError("Entrez un montant valide.");
      return;
    }
    setError("");
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type,
      amount: value,
      category,
      note: note.trim(),
      date,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setAmount("");
    setNote("");
    loadTransactions();
  };

  const removeTransaction = async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    loadTransactions();
  };

  const stats = useMemo(() => {
    const revenus = transactions.filter((t) => t.type === "revenu").reduce((s, t) => s + Number(t.amount), 0);
    const depenses = transactions.filter((t) => t.type === "depense").reduce((s, t) => s + Number(t.amount), 0);
    return { revenus, depenses, solde: revenus - depenses };
  }, [transactions]);

  const pieData = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === "depense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!map[key]) map[key] = { month: key, Revenus: 0, Dépenses: 0 };
      if (t.type === "revenu") map[key].Revenus += Number(t.amount);
      else map[key].Dépenses += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const fmt = (n) =>
    new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(n);

  return (
    <div className="dash-wrap">
      <header className="dash-header">
        <div>
          <h1>Mon budget</h1>
          <p className="dash-user">{user.email}</p>
        </div>
        <button className="btn-ghost" onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </header>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label kpi-green">Revenus</span>
          <p className="kpi-value">{fmt(stats.revenus)}</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label kpi-coral">Dépenses</span>
          <p className="kpi-value">{fmt(stats.depenses)}</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label kpi-navy">Solde</span>
          <p className={`kpi-value ${stats.solde < 0 ? "neg" : "pos"}`}>{fmt(stats.solde)}</p>
        </div>
      </div>

      <div className="card form-card">
        <div className="type-toggle">
          <button className={type === "depense" ? "active" : ""} onClick={() => handleTypeChange("depense")}>Dépense</button>
          <button className={type === "revenu" ? "active" : ""} onClick={() => handleTypeChange("revenu")}>Revenu</button>
        </div>
        <div className="form-grid">
          <input type="number" min="0" step="0.01" placeholder="Montant" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {(type === "depense" ? CAT_DEP : CAT_REV).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="text" placeholder="Note (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button className="btn-primary" onClick={addTransaction}>Ajouter</button>
      </div>

      {!loading && transactions.length > 0 && (
        <div className="charts-row">
          <div className="card">
            <h3>Dépenses par catégorie</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="muted">Aucune dépense pour l'instant.</p>}
          </div>
          <div className="card">
            <h3>Évolution mensuelle</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenus" fill="#2a5d5a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#c96f4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Transactions récentes</h3>
        {loading ? (
          <p className="muted">Chargement…</p>
        ) : transactions.length === 0 ? (
          <p className="muted">Aucune transaction. Ajoute ta première dépense ou ton premier revenu ci-dessus.</p>
        ) : (
          <div className="tx-list">
            {transactions.map((t) => (
              <div key={t.id} className="tx-row">
                <div className="tx-info">
                  <p className="tx-cat">{t.category}{t.note ? ` · ${t.note}` : ""}</p>
                  <p className="tx-date">{t.date}</p>
                </div>
                <div className="tx-right">
                  <span className={t.type === "revenu" ? "pos" : "neg"}>
                    {t.type === "revenu" ? "+" : "-"}{fmt(t.amount)}
                  </span>
                  <button className="tx-del" onClick={() => removeTransaction(t.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
