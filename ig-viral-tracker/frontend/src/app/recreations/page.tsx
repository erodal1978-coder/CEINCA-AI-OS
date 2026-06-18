"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function RecreationsPage() {
  const [userId, setUserId] = useState("");
  const [recreations, setRecreations] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (!userId) return;
    const data = await api.listRecreations(userId);
    setRecreations(data);
    setLoaded(true);
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Historial de Recreaciones</h2>

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
        <div className="space-y-4">
          {recreations.map((r) => (
            <div key={r.id} className="rounded-lg bg-gray-900 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded bg-gray-700 px-2 py-0.5 text-xs">{r.status}</span>
                <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>

              {r.generated_caption && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-brand-500">Caption</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">{r.generated_caption}</p>
                </div>
              )}

              {r.generated_script && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-brand-500">Guion</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-300">{r.generated_script}</p>
                </div>
              )}

              {r.generated_hashtags && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-brand-500">Hashtags</p>
                  <p className="mt-1 text-sm text-gray-300">{r.generated_hashtags.map((h: string) => `#${h}`).join(" ")}</p>
                </div>
              )}

              {r.suggested_publish_time && (
                <p className="text-xs text-gray-500">Publicar: {r.suggested_publish_time}</p>
              )}
            </div>
          ))}
          {recreations.length === 0 && <p className="text-gray-500">No hay recreaciones generadas.</p>}
        </div>
      )}
    </div>
  );
}
