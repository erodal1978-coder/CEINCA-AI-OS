"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function AccountsPage() {
  const [userId, setUserId] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newTags, setNewTags] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (!userId) return;
    const data = await api.listAccounts(userId);
    setAccounts(data);
    setLoaded(true);
  };

  const addAccount = async () => {
    if (!newUsername) return;
    await api.addAccount(userId, {
      ig_username: newUsername.replace("@", ""),
      niche_tags: newTags ? newTags.split(",").map((t) => t.trim()) : undefined,
    });
    setNewUsername("");
    setNewTags("");
    load();
  };

  const deleteAccount = async (accountId: string) => {
    await api.deleteAccount(userId, accountId);
    load();
  };

  const scanAccount = async (accountId: string) => {
    await api.triggerScan(userId, accountId);
    alert("Escaneo en cola");
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Cuentas Rastreadas</h2>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm"
        />
        <button onClick={load} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-700">
          Cargar
        </button>
      </div>

      {loaded && (
        <>
          <div className="mb-6 flex gap-3">
            <input
              type="text"
              placeholder="@username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Tags: fitness, tech"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm"
            />
            <button onClick={addAccount} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700">
              Agregar
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
                <div>
                  <p className="font-medium">@{a.ig_username}</p>
                  <p className="text-xs text-gray-500">
                    Avg likes: {Math.round(a.avg_likes_30d)} | Tags: {a.niche_tags?.join(", ") || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => scanAccount(a.id)} className="rounded bg-blue-600 px-3 py-1 text-xs hover:bg-blue-700">
                    Escanear
                  </button>
                  <button onClick={() => deleteAccount(a.id)} className="rounded bg-red-600 px-3 py-1 text-xs hover:bg-red-700">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {accounts.length === 0 && <p className="text-gray-500">No hay cuentas rastreadas.</p>}
          </div>
        </>
      )}
    </div>
  );
}
