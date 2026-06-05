import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

function normalizeHandle(input) {
  if (!input) return "";
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/^www\./i, "");
  s = s.replace(/^instagram\.com\//i, "");
  s = s.replace(/^@/, "");
  s = s.split("?")[0].replace(/\/$/, "").split("/")[0];
  return s;
}

function parseLines(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function Home() {
  const [tab, setTab] = useState("check");
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check tab
  const [checkInput, setCheckInput] = useState("");
  const [checkResults, setCheckResults] = useState([]);
  const [checking, setChecking] = useState(false);

  // Add tab
  const [addInput, setAddInput] = useState("");
  const [addMsg, setAddMsg] = useState(null);
  const [adding, setAdding] = useState(false);

  // Manage tab
  const [manageClients, setManageClients] = useState([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");

  const fetchTotal = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setTotalClients(data.clients.length);
  }, []);

  useEffect(() => { fetchTotal(); }, [fetchTotal]);

  // CHECK
  const handleCheck = async () => {
    const lines = parseLines(checkInput);
    if (!lines.length) return;
    setChecking(true);
    setCheckResults([]);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handles: lines }),
      });
      const data = await res.json();
      setCheckResults(data.results);
    } finally {
      setChecking(false);
    }
  };

  // ADD
  const handleAdd = async () => {
    const lines = parseLines(addInput);
    if (!lines.length) return;
    setAdding(true);
    setAddMsg(null);
    try {
      const entries = lines.map((line) => {
        const parts = line.split(/[\t,;]/).map((p) => p.trim());
        if (parts.length > 1) return { name: parts[0], handle: parts[1] };
        return { name: "", handle: parts[0] };
      });
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      setAddMsg({ type: "ok", text: `✅ ${data.added} adicionado(s). ${data.skipped > 0 ? `${data.skipped} já existia(m).` : ""} Total: ${data.total} clientes.` });
      setAddInput("");
      fetchTotal();
    } catch {
      setAddMsg({ type: "err", text: "Erro ao adicionar. Tente novamente." });
    } finally {
      setAdding(false);
    }
  };

  // MANAGE
  const loadManage = useCallback(async () => {
    setManageLoading(true);
    const res = await fetch("/api/clients");
    const data = await res.json();
    setManageClients(data.clients.reverse());
    setManageLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "manage") loadManage();
  }, [tab, loadManage]);

  const handleDelete = async (handle) => {
    await fetch("/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });
    setDeleteConfirm(null);
    loadManage();
    fetchTotal();
  };

  const filteredClients = manageClients.filter(
    (c) =>
      !search ||
      c.handle.includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const checkFound = checkResults.filter((r) => r.isClient).length;
  const checkNotFound = checkResults.filter((r) => !r.isClient).length;

  return (
    <>
      <Head>
        <title>SDR Checker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">
        <div className="container">
          {/* Header */}
          <div className="header">
            <div className="logo">
              <span className="logo-icon">◎</span>
              <div>
                <h1 className="title">SDR <span className="accent">Checker</span></h1>
                <p className="subtitle">{totalClients.toLocaleString("pt-BR")} clientes na base</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {[["check", "🔍 Verificar"], ["add", "➕ Adicionar"], ["manage", "📋 Gerenciar"]].map(([key, label]) => (
              <button key={key} className={`tab ${tab === key ? "tab-active" : ""}`} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>

          {/* CHECK TAB */}
          {tab === "check" && (
            <div className="card">
              <p className="card-label">Cole um ou vários links/@ do Instagram</p>
              <p className="hint">Um por linha. Aceita @handle, instagram.com/perfil ou URL completa.</p>
              <textarea
                className="textarea"
                rows={6}
                placeholder={"@arquitetojoao\ninstagram.com/studioarq\nhttps://www.instagram.com/casadesign/\n@mariana.arquitetura"}
                value={checkInput}
                onChange={(e) => { setCheckInput(e.target.value); setCheckResults([]); }}
              />
              <button className="btn-primary" onClick={handleCheck} disabled={checking || !checkInput.trim()}>
                {checking ? "Verificando..." : `Verificar ${parseLines(checkInput).length > 0 ? `(${parseLines(checkInput).length})` : ""}`}
              </button>

              {checkResults.length > 0 && (
                <div className="results-wrap">
                  <div className="results-summary">
                    <span className="badge badge-green">✅ {checkFound} cliente(s)</span>
                    <span className="badge badge-red">❌ {checkNotFound} não cliente(s)</span>
                  </div>
                  <div className="results-list">
                    {checkResults.map((r, i) => (
                      <div key={i} className={`result-item ${r.isClient ? "result-found" : "result-not"}`}>
                        <span className="result-icon">{r.isClient ? "✅" : "❌"}</span>
                        <div className="result-info">
                          <span className="result-handle">@{r.handle}</span>
                          {r.isClient && <span className="result-name">{r.clientData.name}</span>}
                        </div>
                        <span className={`result-tag ${r.isClient ? "tag-green" : "tag-red"}`}>
                          {r.isClient ? "Cliente" : "Não cliente"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD TAB */}
          {tab === "add" && (
            <div className="card">
              <p className="card-label">Adicionar clientes em massa</p>
              <p className="hint">
                Cole direto da planilha — um por linha.<br />
                Formato aceito: só o link/@ <strong>ou</strong> <code>Nome, @handle</code>
              </p>
              <textarea
                className="textarea"
                rows={10}
                placeholder={"João Arquiteto, @joaoarq\nStudio Casa, instagram.com/studiocasa\n@mariana.arq\nhttps://www.instagram.com/arquitetura.moderna/"}
                value={addInput}
                onChange={(e) => { setAddInput(e.target.value); setAddMsg(null); }}
              />
              <button className="btn-primary" onClick={handleAdd} disabled={adding || !addInput.trim()}>
                {adding ? "Salvando..." : `Adicionar ${parseLines(addInput).length > 0 ? `${parseLines(addInput).length} entradas` : ""}`}
              </button>
              {addMsg && (
                <div className={`msg ${addMsg.type === "ok" ? "msg-ok" : "msg-err"}`}>
                  {addMsg.text}
                </div>
              )}
            </div>
          )}

          {/* MANAGE TAB */}
          {tab === "manage" && (
            <div className="card">
              <p className="card-label">Base de clientes</p>
              <input
                className="input"
                placeholder="Buscar por nome ou @handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {manageLoading ? (
                <p className="loading-text">Carregando...</p>
              ) : (
                <div className="client-list">
                  {filteredClients.length === 0 && (
                    <p className="empty-text">Nenhum cliente encontrado.</p>
                  )}
                  {filteredClients.map((c) => (
                    <div key={c.handle} className="client-item">
                      <div className="client-avatar">{(c.name?.[0] || "?").toUpperCase()}</div>
                      <div className="client-info">
                        <span className="client-name">{c.name}</span>
                        <span className="client-handle">@{c.handle}</span>
                      </div>
                      {deleteConfirm === c.handle ? (
                        <div className="del-confirm">
                          <span className="del-label">Excluir?</span>
                          <button className="btn-del-yes" onClick={() => handleDelete(c.handle)}>Sim</button>
                          <button className="btn-del-no" onClick={() => setDeleteConfirm(null)}>Não</button>
                        </div>
                      ) : (
                        <button className="btn-del" onClick={() => setDeleteConfirm(c.handle)}>🗑</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx global>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0c0c0c; color: #f0f0f0; font-family: 'DM Sans', sans-serif; }
          code { font-family: 'DM Mono', monospace; font-size: 12px; background: #222; padding: 1px 5px; border-radius: 4px; }

          .root { min-height: 100vh; padding: 0 0 60px; }
          .container { max-width: 520px; margin: 0 auto; padding: 32px 16px 0; }

          .header { margin-bottom: 28px; }
          .logo { display: flex; align-items: center; gap: 14px; }
          .logo-icon { font-size: 32px; color: #FF6B35; line-height: 1; }
          .title { font-size: 26px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.5px; }
          .accent { color: #FF6B35; }
          .subtitle { font-size: 13px; color: #666; margin-top: 3px; }

          .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
          .tab { flex: 1; padding: 10px 0; border-radius: 10px; border: 1.5px solid #222; background: #161616; color: #666; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.18s; }
          .tab:hover { border-color: #FF6B35; color: #ccc; }
          .tab-active { background: #FF6B35; border-color: #FF6B35; color: #fff; }

          .card { background: #161616; border-radius: 14px; border: 1.5px solid #222; padding: 22px 18px; }
          .card-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
          .hint { font-size: 12px; color: #555; line-height: 1.6; margin-bottom: 14px; }

          .textarea { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #2a2a2a; background: #0f0f0f; color: #e0e0e0; font-size: 13px; font-family: 'DM Mono', monospace; resize: vertical; outline: none; transition: border-color 0.2s; }
          .textarea:focus { border-color: #FF6B35; }
          .input { width: 100%; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #2a2a2a; background: #0f0f0f; color: #e0e0e0; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 14px; transition: border-color 0.2s; }
          .input:focus { border-color: #FF6B35; }

          .btn-primary { width: 100%; margin-top: 12px; padding: 13px; border-radius: 10px; background: #FF6B35; border: none; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.18s; }
          .btn-primary:hover { opacity: 0.88; }
          .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

          .results-wrap { margin-top: 18px; }
          .results-summary { display: flex; gap: 10px; margin-bottom: 12px; }
          .badge { padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .badge-green { background: #0d2e1a; color: #4ade80; border: 1px solid #1a5c32; }
          .badge-red { background: #2a0d0d; color: #f87171; border: 1px solid #5c1a1a; }

          .results-list { display: flex; flex-direction: column; gap: 6px; max-height: 360px; overflow-y: auto; }
          .result-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; border: 1px solid #222; }
          .result-found { background: #0a1f10; border-color: #1a3a20; }
          .result-not { background: #1a0a0a; border-color: #3a1a1a; }
          .result-icon { font-size: 16px; flex-shrink: 0; }
          .result-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
          .result-handle { font-size: 13px; color: #ddd; font-family: 'DM Mono', monospace; }
          .result-name { font-size: 11px; color: #888; margin-top: 2px; }
          .result-tag { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }
          .tag-green { background: #0d2e1a; color: #4ade80; }
          .tag-red { background: #2a0d0d; color: #f87171; }

          .msg { margin-top: 14px; padding: 12px 16px; border-radius: 9px; font-size: 13px; font-weight: 500; line-height: 1.5; }
          .msg-ok { background: #0d2e1a; color: #4ade80; border: 1px solid #1a5c32; }
          .msg-err { background: #2a0d0d; color: #f87171; border: 1px solid #5c1a1a; }

          .loading-text { color: #555; text-align: center; padding: 24px 0; font-size: 14px; }
          .empty-text { color: #444; text-align: center; padding: 24px 0; font-size: 14px; }

          .client-list { display: flex; flex-direction: column; gap: 6px; max-height: 420px; overflow-y: auto; margin-top: 4px; }
          .client-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; background: #0f0f0f; border: 1px solid #222; }
          .client-avatar { width: 34px; height: 34px; border-radius: 50%; background: #FF6B35; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
          .client-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
          .client-name { font-size: 14px; color: #eee; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .client-handle { font-size: 12px; color: #666; font-family: 'DM Mono', monospace; }

          .btn-del { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; color: #444; border-radius: 6px; }
          .btn-del:hover { color: #f87171; }
          .del-confirm { display: flex; align-items: center; gap: 6px; }
          .del-label { font-size: 11px; color: #f87171; }
          .btn-del-yes { padding: 4px 10px; border-radius: 6px; border: none; background: #e53e3e; color: #fff; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
          .btn-del-no { padding: 4px 10px; border-radius: 6px; border: 1px solid #333; background: none; color: #888; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        `}</style>
      </div>
    </>
  );
}
