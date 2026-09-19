/**
 * Preprocessing Tab Component
 * Demonstrates StandardScaler (z-score normalization)
 * Formula: z = (x - μ) / σ
 */

import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { FeatureStats, ScalerParams, IrisRecord } from '../types';
import { StandardScaler } from '../ml/scaler';

interface PreprocessingTabProps {
  scalerParams: ScalerParams;
  setScalingEnabled: (enabled: boolean) => void;
  featureStats: FeatureStats[];
  dataset: IrisRecord[];
}

export const PreprocessingTab: React.FC<PreprocessingTabProps> = ({
  scalerParams,
  setScalingEnabled,
  featureStats,
  dataset
}) => {
  // Comparative bar chart data: Raw Variance vs Scaled Variance
  const varianceChartData = featureStats.map((stat, i) => {
    const rawStd = stat.std;
    const scaledStd = scalerParams.enabled ? 1.0 : rawStd;
    return {
      feature: stat.label.replace(' ', '\n'),
      fullName: stat.label,
      rawStd: Number(rawStd.toFixed(2)),
      scaledStd: Number(scaledStd.toFixed(2)),
      mean: Number(stat.mean.toFixed(2))
    };
  });

  // First 5 sample rows raw vs transformed
  const sampleRows = dataset.slice(0, 5);
  const sampleRawMatrix = sampleRows.map((r) => [r.sepalLength, r.sepalWidth, r.petalLength, r.petalWidth]);
  const sampleTransformed = StandardScaler.transform(sampleRawMatrix, {
    ...scalerParams,
    enabled: true // Always show scaled values here for comparison
  });

  return (
    <div id="preprocessing-tab-container" className="space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              StandardScaler (Z-Score Normalization)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Standardizes features by subtracting the empirical mean and dividing by the standard deviation:
            <span className="font-mono font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              z = (x - μ) / σ
            </span>
          </p>
        </div>

        {/* Global Scaling Toggle */}
        <div className="flex items-center space-x-3 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Feature Scaling:
          </span>
          <button
            id="preprocessing-scaling-toggle-btn"
            type="button"
            onClick={() => setScalingEnabled(!scalerParams.enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              scalerParams.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                scalerParams.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              scalerParams.enabled
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}
          >
            {scalerParams.enabled ? 'ENABLED' : 'DISABLED (RAW)'}
          </span>
        </div>
      </div>

      {/* Interactive Explanation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Why Scaling Matters in K-Means */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Why Scaling Matters in K-Means
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            K-Means relies directly on <strong>Euclidean distance</strong>:{' '}
            <code className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
              d = √(Δx₁² + Δx₂² + Δx₃² + Δx₄²)
            </code>
            . In the Iris dataset, <em>Petal Length</em> spans from 1.0 to 6.9 cm (variance ~3.11), while <em>Sepal Width</em> only spans from 2.0 to 4.4 cm (variance ~0.19).
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Without normalization, Petal Length contributes up to <strong>16× more</strong> to the squared distance than Sepal Width, artificially pulling cluster centroids along the petal length axis.
          </p>
        </div>

        {/* What StandardScaler Does */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            StandardScaler Effect on Statistics
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Mean of Scaled Features (μ):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">0.000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Standard Deviation (σ):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">1.000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Relative Feature Influence:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Equalized (1:1:1:1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Parameters Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Fitted StandardScaler Parameters (μ and σ per feature)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">Raw Mean (μ)</th>
                <th className="py-2.5 px-3">Raw Std Dev (σ)</th>
                <th className="py-2.5 px-3">Raw Range (Min - Max)</th>
                <th className="py-2.5 px-3">Scaled Mean</th>
                <th className="py-2.5 px-3">Scaled Std Dev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {featureStats.map((stat, i) => (
                <tr key={stat.feature} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {stat.label}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {scalerParams.means[i]?.toFixed(3) ?? stat.mean.toFixed(3)} cm
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {scalerParams.stds[i]?.toFixed(3) ?? stat.std.toFixed(3)} cm
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-500">
                    {stat.min.toFixed(1)} – {stat.max.toFixed(1)} cm
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {scalerParams.enabled ? '0.000' : stat.mean.toFixed(3)}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {scalerParams.enabled ? '1.000' : stat.std.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart: Standard Deviation Comparison */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Feature Standard Deviation Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shows how scaling eliminates the massive disparity in standard deviation across features.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={varianceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="fullName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Std Dev (σ)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="rawStd" name="Raw Standard Deviation" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="scaledStd" name="Scaled Standard Deviation" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
          When scaling is enabled, all features have unit variance (σ = 1.0), giving each biological feature equal weight during centroid optimization.
        </p>
      </div>

      {/* Raw vs Scaled Sample Rows Comparison */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Sample Data Points: Raw vs Z-Score Scaled (First 5 Rows)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Species</th>
                <th className="py-2 px-3">Raw Sepal L / W (cm)</th>
                <th className="py-2 px-3">Raw Petal L / W (cm)</th>
                <th className="py-2 px-3">Scaled Z-Score [SL, SW, PL, PW]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {sampleRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="py-2 px-3 text-slate-400">{row.id}</td>
                  <td className="py-2 px-3 capitalize font-sans font-medium text-blue-600 dark:text-blue-400">
                    {row.species}
                  </td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                    [{row.sepalLength.toFixed(1)}, {row.sepalWidth.toFixed(1)}]
                  </td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                    [{row.petalLength.toFixed(1)}, {row.petalWidth.toFixed(1)}]
                  </td>
                  <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                    [{sampleTransformed[i].map((v) => v.toFixed(2)).join(', ')}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
