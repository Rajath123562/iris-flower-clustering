/**
 * Elbow Method Tab Component
 * Evaluates K-Means for k = 1 to 10:
 * - Inertia vs k line chart with k = 3 highlighted
 * - Silhouette score vs k line chart with peak/k = 3 highlighted
 * - Plain-English explanations and marginal change data table
 */

import React from 'react';
import {
  TrendingDown,
  Activity,
  Award,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { ElbowPoint } from '../types';

interface ElbowTabProps {
  elbowData: ElbowPoint[];
  currentK: number;
  onSelectK: (k: number) => void;
  isCalculating: boolean;
}

export const ElbowTab: React.FC<ElbowTabProps> = ({
  elbowData,
  currentK,
  onSelectK,
  isCalculating
}) => {
  // Find point for k=3
  const k3Point = elbowData.find((p) => p.k === 3);

  // Find max silhouette score
  const silhouettePoints = elbowData.filter((p) => p.k >= 2);
  const bestSilhouette = silhouettePoints.reduce(
    (prev, curr) => (curr.silhouette > prev.silhouette ? curr : prev),
    silhouettePoints[0] || { k: 2, silhouette: 0 }
  );

  return (
    <div id="elbow-tab-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            Elbow Method & Silhouette Optimization (k = 1 to 10)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Empirical techniques to select the optimal number of clusters without ground-truth labels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Currently active:</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs font-mono">
            k = {currentK}
          </span>
        </div>
      </div>

      {/* Two Column Charts: Inertia vs k & Silhouette vs k */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inertia vs k (Elbow Curve) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              Inertia (WCSS) vs. k
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              k = 3 Highlighted
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elbowData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="k"
                  type="number"
                  domain={[1, 10]}
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Inertia (WCSS)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ElbowPoint;
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 shadow-lg border border-slate-800">
                          <p className="font-bold text-blue-300">k = {data.k}</p>
                          <p className="font-mono">Inertia: {data.inertia.toFixed(2)}</p>
                          {data.k === 3 && <p className="text-[11px] text-amber-300 font-medium">★ Highlighted (Iris biological count)</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  x={3}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{ value: 'k = 3 (Elbow)', position: 'top', fill: '#ef4444', fontSize: 11, fontWeight: 600 }}
                />
                {k3Point && (
                  <ReferenceDot
                    x={3}
                    y={k3Point.inertia}
                    r={6}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="inertia"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Plain-English Explanation of the Elbow:
            </span>
            As k increases from 1 to 2 and 3, inertia drops steeply because real cluster structure is discovered. After k = 3, the curve flattens significantly (the "elbow"), indicating that higher k values simply partition natural clusters into redundant sub-clusters with diminishing returns.
          </div>
        </div>

        {/* Chart 2: Silhouette Score vs k */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Silhouette Score vs. k
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              Higher is Better
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={silhouettePoints}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="k"
                  type="number"
                  domain={[2, 10]}
                  ticks={[2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Mean Silhouette', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ElbowPoint;
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 shadow-lg border border-slate-800">
                          <p className="font-bold text-emerald-300">k = {data.k}</p>
                          <p className="font-mono">Silhouette: {data.silhouette.toFixed(4)}</p>
                          {data.k === 3 && <p className="text-[11px] text-amber-300 font-medium">★ Highlighted (k = 3)</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  x={3}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{ value: 'k = 3', position: 'top', fill: '#ef4444', fontSize: 11, fontWeight: 600 }}
                />
                {k3Point && (
                  <ReferenceDot
                    x={3}
                    y={k3Point.silhouette}
                    r={6}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="silhouette"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 6, fill: '#047857' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Plain-English Explanation of Silhouette Score:
            </span>
            Silhouette evaluates how close points are to their own cluster versus the nearest neighboring cluster (-1 to +1). While k = 2 mathematically produces the highest score because Setosa isolates cleanly from the rest, k = 3 preserves high cohesion while aligning with the true botanical species count.
          </div>
        </div>
      </div>

      {/* Numerical Table of k = 1 to 10 */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Metrics Breakdown for k = 1 to 10
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">k (Clusters)</th>
                <th className="py-2.5 px-3">Inertia (WCSS)</th>
                <th className="py-2.5 px-3">Δ Inertia (Reduction)</th>
                <th className="py-2.5 px-3">Silhouette Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {elbowData.map((pt, i) => {
                const prevInertia = i > 0 ? elbowData[i - 1].inertia : null;
                const deltaInertia = prevInertia !== null ? prevInertia - pt.inertia : null;
                const isCurrent = pt.k === currentK;
                const isK3 = pt.k === 3;

                return (
                  <tr
                    key={pt.k}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                      isK3 ? 'bg-blue-50/40 dark:bg-blue-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
                      <span>k = {pt.k}</span>
                      {isK3 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          Iris k
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {pt.inertia.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">
                      {deltaInertia !== null ? `-${deltaInertia.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {pt.k >= 2 ? pt.silhouette.toFixed(4) : 'N/A (k=1)'}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[11px]">
                      {isCurrent ? (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">● Active in App</span>
                      ) : isK3 ? (
                        <span className="text-amber-600 dark:text-amber-400">Recommended</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <button
                        id={`select-k-${pt.k}-btn`}
                        disabled={isCurrent}
                        onClick={() => onSelectK(pt.k)}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isCurrent ? 'Active' : `Set k=${pt.k}`}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
