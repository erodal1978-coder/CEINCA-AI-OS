"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DashboardData {
  total_tracked_accounts: number;
  total_viral_posts: number;
  total_recreations: number;
  top_accounts: { username: string; viral_count: number }[];
  recent_virals: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const d = await api.getDashboard(userId);
      setData(d);
    } catch {
      // handle error
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm"
          />
          <button
            onClick={loadDashboard}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-700"
          >
            Cargar
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-400">Cargando...</p>}

      {data && (
        <>
          <div className="mb-8 grid grid-cols-3 gap-4">
            <StatCard label="Cuentas Rastreadas" value={data.total_tracked_accounts} />
            <StatCard label="Posts Virales" value={data.total_viral_posts} />
            <StatCard label="Recreaciones" value={data.total_recreations} />
          </div>

          {data.top_accounts.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-lg font-semibold">Top Cuentas con Virales</h3>
              <div className="space-y-2">
                {data.top_accounts.map((a) => (
                  <div key={a.username} className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3">
                    <span className="font-medium">@{a.username}</span>
                    <span className="text-brand-500">{a.viral_count} virales</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recent_virals.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Virales Recientes</h3>
              <div className="space-y-3">
                {data.recent_virals.map((v: any) => (
                  <div key={v.id} className="rounded-lg bg-gray-900 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{v.post_type}</span>
                      <span className="font-bold text-green-400">{v.virality_multiplier}x</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{v.caption?.slice(0, 120)}...</p>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>{v.likes_count.toLocaleString()} likes</span>
                      <span>{v.comments_count.toLocaleString()} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-900 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
