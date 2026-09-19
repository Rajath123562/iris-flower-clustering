/**
 * K-Means Algorithm Results Tab
 * Shows:
 * - Convergence summary (iterations, inertia, convergence state)
 * - Table of computed centroids (in raw cm and scaled units)
 * - Cluster point distribution
 * - Step-by-step algorithmic explanation
 */

import React from 'react';
import {
  CheckCircle,
  Clock,
  Activity,
  Target,
  BarChart3,
  HelpCircle,
  Hash
} from 'lucide-react';
import { KMeansResult, ComparisonMetrics, ScalerParams } from '../types';
import { getClusterColor } from '../utils/colors';

interface KMeansTabProps {
  kmeans: KMeansResult | null;
  metrics: ComparisonMetrics | null;
  scalerParams: ScalerParams;
  onRerun: () => void;
  seed: number;
}

export const KMeansTab: React.FC<KMeansTabProps> = ({
  kmeans,
  metrics,
  scalerParams,
  seed
}) => {
  if (!kmeans) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">K-Means model is initializing...</p>
      </div>
    );
  }

  // Calculate distribution of points across clusters
  const clusterCounts: number[] = new Array(kmeans.k).fill(0);
  for (const c of kmeans.clusters) {
    if (c >= 0 && c < kmeans.k) {
      clusterCounts[c]++;
    }
  }

  return (
    <div id="kmeans-tab-container" className="space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            K-Means Convergence & Centroids
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optimized with k-means++ initialization, seeded PRNG (seed = {seed}), and max 300 Lloyd iterations.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Iterations */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Iterations</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {kmeans.iterations}
            </span>
            <span className="text-xs text-slate-400">/ 300 max</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {kmeans.converged ? 'Converged stably (Δ < 1e-6)' : 'Reached max iterations'}
          </p>
        </div>

        {/* Inertia */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Inertia (WCSS)</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {kmeans.inertia.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Within-Cluster Sum of Squares (Σ||x - μ||²)
          </p>
        </div>

        {/* Clusters k */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Number of Clusters</span>
            <Hash className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              k = {kmeans.k}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {kmeans.k === 3 ? 'Matches 3 true biological species' : 'Custom cluster count'}
          </p>
        </div>

        {/* Random Seed */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Random Seed</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Mulberry32
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {seed}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Guarantees identical runs across sessions
          </p>
        </div>
      </div>

      {/* Centroids Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Learned Centroid Coordinates (Cluster Centers)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mean feature vectors representing the geometric center of each cluster in original feature scale (cm).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table id="kmeans-centroids-table" className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Cluster</th>
                <th className="py-2.5 px-3">Mapped Majority Species</th>
                <th className="py-2.5 px-3">Sepal Length (cm)</th>
                <th className="py-2.5 px-3">Sepal Width (cm)</th>
                <th className="py-2.5 px-3">Petal Length (cm)</th>
                <th className="py-2.5 px-3">Petal Width (cm)</th>
                <th className="py-2.5 px-3">Assigned Samples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {kmeans.rawCentroids.map((centroid, cIdx) => {
                const color = getClusterColor(cIdx);
                const count = clusterCounts[cIdx] || 0;
                const pct = ((count / kmeans.clusters.length) * 100).toFixed(1);
                const mappedSpecies = metrics?.clusterToSpeciesMap[cIdx] || 'Unassigned';

                return (
                  <tr key={cIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-medium">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          Cluster {cIdx}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 capitalize font-semibold text-blue-600 dark:text-blue-400">
                      {mappedSpecies}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{centroid[0].toFixed(2)} cm</td>
                    <td className="py-2.5 px-3 font-mono">{centroid[1].toFixed(2)} cm</td>
                    <td className="py-2.5 px-3 font-mono">{centroid[2].toFixed(2)} cm</td>
                    <td className="py-2.5 px-3 font-mono">{centroid[3].toFixed(2)} cm</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({pct}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Centroids in Scaled Space (if scaling is enabled) */}
      {scalerParams.enabled && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Centroids in Normalized Z-Score Space (Used During Lloyd Iterations)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
            {kmeans.centroids.map((c, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5 mb-1 text-slate-600 dark:text-slate-400 font-sans font-medium text-[11px]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getClusterColor(i) }}
                  />
                  <span>Cluster {i} Z-Vector:</span>
                </div>
                <div className="text-slate-800 dark:text-slate-200 text-[11px]">
                  [{c.map((v) => v.toFixed(3)).join(', ')}]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithmic Details */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          K-Means++ Mechanics & Convergence Guarantee
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">1. k-means++ Seeding</span>
            <p>
              Instead of selecting arbitrary random points, k-means++ selects initial centers with probability proportional to the squared Euclidean distance to the closest center: D(x)². This yields an O(log k) approximation guarantee.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">2. Lloyd's Assignment</span>
            <p>
              Points are assigned to their closest centroid in Voronoi cells. Centroids then update to the center-of-mass (mean) of all member points, monotonically reducing total inertia at each iteration.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">3. Convergence Check</span>
            <p>
              The loop terminates when centroid displacement is less than 1e-6 or when assignments stop changing, ensuring guaranteed mathematical convergence in finite steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
