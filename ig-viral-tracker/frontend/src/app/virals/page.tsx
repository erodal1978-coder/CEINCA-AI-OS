"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ViralsPage() {
  const [userId, setUserId] = useState("");
  const [virals, setVirals] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (!userId) return;
    const data = await api.listVirals(userId);
    setVirals(data);
    setLoaded(true);
  };

  const recreate = async (viralId: string) => {
    try {
      const result = await api.createRecreation(userId, { viral_post_id: viralId });
      setSelected(result);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Posts Virales Detectados</h2>

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
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {virals.map((v) => (
              <div
                key={v.id}
                className="cursor-pointer rounded-lg bg-gray-900 p-4 transition hover:bg-gray-800"
                onClick={() => setSelected(v)}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-gray-700 px-2 py-0.5 text-xs">{v.post_type}</span>
                  <span className="text-lg font-bold text-green-400">{v.virality_multiplier}x</span>
                </div>
                <p className="mt-2 text-sm text-gray-300">{v.caption?.slice(0, 150)}</p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>{v.likes_count.toLocaleString()} likes</span>
                  <span>{v.comments_count.toLocaleString()} comentarios</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={v.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600"
                  >
                    Ver original
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); recreate(v.id); }}
                    className="rounded bg-brand-600 px-3 py-1 text-xs hover:bg-brand-700"
                  >
                    Recrear con IA
                  </button>
                </div>
              </div>
            ))}
            {virals.length === 0 && <p className="text-gray-500">No se han detectado virales aun.</p>}
          </div>

          {selected && (
            <div className="rounded-lg bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">
                {selected.generated_caption ? "Recreacion Generada" : "Analisis del Viral"}
              </h3>

              {selected.ai_analysis && (
                <div className="space-y-2 text-sm">
                  {Object.entries(selected.ai_analysis).map(([key, val]) => (
                    <div key={key}>
                      <span className="font-medium text-brand-500">{key}:</span>{" "}
                      <span className="text-gray-300">
                        {Array.isArray(val) ? (val as string[]).join(", ") : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selected.generated_caption && (
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-brand-500">Caption:</p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-300">{selected.generated_caption}</p>
                  </div>
                  {selected.generated_script && (
                    <div>
                      <p className="font-medium text-brand-500">Guion:</p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-300">{selected.generated_script}</p>
                    </div>
                  )}
                  {selected.generated_hashtags && (
                    <div>
                      <p className="font-medium text-brand-500">Hashtags:</p>
                      <p className="mt-1 text-gray-300">{selected.generated_hashtags.map((h: string) => `#${h}`).join(" ")}</p>
                    </div>
                  )}
                  {selected.thumbnail_prompt && (
                    <div>
                      <p className="font-medium text-brand-500">Prompt para thumbnail:</p>
                      <p className="mt-1 text-gray-300">{selected.thumbnail_prompt}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
