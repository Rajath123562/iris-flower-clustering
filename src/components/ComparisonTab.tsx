/**
 * Comparison & Evaluation Tab Component
 * Features:
 * - Accuracy, Adjusted Rand Index (ARI), Silhouette score metrics cards
 * - Cluster-to-Species majority mapping
 * - Confusion Matrix Heatmap
 * - Misclassified points table
 * - Auto-generated "Findings" analytical report
 */

import React, { useState } from 'react';
import {
  Scale,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { ComparisonMetrics, KMeansResult, PCAResult, ScalerParams } from '../types';
import { generateFindings } from '../ml/findings';
import { getClusterColor, SPECIES_BG_CLASSES } from '../utils/colors';

interface ComparisonTabProps {
  metrics: ComparisonMetrics | null;
  kmeans: KMeansResult | null;
  pca: PCAResult | null;
  scalerParams: ScalerParams;
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({
  metrics,
  kmeans,
  pca,
  scalerParams
}) => {
  const [misclassifiedSearch, setMisclassifiedSearch] = useState('');

  if (!metrics || !kmeans || !pca) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">Evaluating clustering comparisons...</p>
      </div>
    );
  }

  const findings = generateFindings(kmeans, metrics, pca, scalerParams);

  // Filter misclassified points
  const filteredMisclassified = metrics.misclassifiedPoints.filter((pt) => {
    const q = misclassifiedSearch.toLowerCase();
    if (!q) return true;
    return (
      pt.id.toString().includes(q) ||
      pt.trueSpecies.toLowerCase().includes(q) ||
      pt.assignedSpecies.toLowerCase().includes(q) ||
      pt.predictedCluster.toString().includes(q)
    );
  });

  // Find max count in confusion matrix for proportional heatmap intensity
  let maxCellCount = 1;
  for (let r = 0; r < metrics.speciesList.length; r++) {
    for (let c = 0; c < metrics.clustersList.length; c++) {
      if (metrics.confusionMatrix[r][c] > maxCellCount) {
        maxCellCount = metrics.confusionMatrix[r][c];
      }
    }
  }

  return (
    <div id="comparison-tab-container" className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          Clustering vs. Ground-Truth Species Comparison
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Evaluating how unsupervised mathematical clusters correlate with biological species taxonomy.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Accuracy after Mapping */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Post-Mapping Accuracy
            </span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.accuracy}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.totalPoints - metrics.misclassifiedCount} of {metrics.totalPoints} flowers correctly grouped
          </p>
        </div>

        {/* Adjusted Rand Index (ARI) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Adjusted Rand Index (ARI)
            </span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {metrics.adjustedRandIndex}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Chance-adjusted similarity (1.0 = perfect agreement)
          </p>
        </div>

        {/* Silhouette Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Mean Silhouette Score
            </span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {metrics.silhouetteScore}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Cohesion vs. separation distance ratio (-1 to +1)
          </p>
        </div>
      </div>

      {/* Majority Species Mapping Table & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cluster-to-Species Mapping Explanation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cluster-to-Species Majority Mapping
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cluster IDs (0, 1, 2...) are arbitrary numbers. Each cluster is mapped to whichever true species has the highest count within it.
            </p>
          </div>

          <div className="space-y-2">
            {metrics.clustersList.map((cIdx) => {
              const mapped = metrics.clusterToSpeciesMap[cIdx];
              const color = getClusterColor(cIdx);
              const spClass = SPECIES_BG_CLASSES[mapped.toLowerCase()] || SPECIES_BG_CLASSES.unknown;

              return (
                <div
                  key={cIdx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cluster {cIdx}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">maps to →</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold capitalize border ${spClass}`}
                    >
                      Iris-{mapped}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confusion Matrix Heatmap */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Confusion Matrix Heatmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rows represent True Species; columns represent Assigned Clusters.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px]">
                  <th className="py-2 px-2 text-left">True Species \ Cluster</th>
                  {metrics.clustersList.map((cIdx) => (
                    <th key={cIdx} className="py-2 px-2">
                      <span className="font-mono">C{cIdx}</span>
                      <span className="block text-[10px] text-slate-400 font-normal capitalize">
                        ({metrics.clusterToSpeciesMap[cIdx]})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics.speciesList.map((species, r) => (
                  <tr key={species}>
                    <td className="py-2.5 px-3 text-left font-bold capitalize text-slate-800 dark:text-slate-200">
                      Iris-{species}
                    </td>
                    {metrics.clustersList.map((cIdx) => {
                      const count = metrics.confusionMatrix[r][cIdx] || 0;
                      const intensity = maxCellCount > 0 ? count / maxCellCount : 0;
                      const isHigh = count > 0 && intensity > 0.5;

                      return (
                        <td key={cIdx} className="py-2.5 px-3">
                          <div
                            className={`py-2 px-3 rounded-lg font-mono font-bold transition-all ${
                              count === 0
                                ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600'
                                : isHigh
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            {count}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Diagonal dominance indicates strong agreement. Off-diagonal numbers show boundary misalignments.
          </p>
        </div>
      </div>

      {/* Misclassified Points Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Misclassified Specimens ({metrics.misclassifiedCount} of {metrics.totalPoints})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Samples where unsupervised cluster majority label differs from the botanical ground truth.
            </p>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter misclassified..."
              value={misclassifiedSearch}
              onChange={(e) => setMisclassifiedSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {metrics.misclassifiedCount === 0 ? (
          <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Flawless 100% agreement! No specimens were misclassified in this configuration.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Flower ID</th>
                  <th className="py-2.5 px-3">True Species</th>
                  <th className="py-2.5 px-3">Predicted Cluster</th>
                  <th className="py-2.5 px-3">Mapped Label</th>
                  <th className="py-2.5 px-3">Measurements [SL, SW, PL, PW]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredMisclassified.map((pt) => {
                  const trueClass =
                    SPECIES_BG_CLASSES[pt.trueSpecies.toLowerCase()] || SPECIES_BG_CLASSES.unknown;
                  const assignedClass =
                    SPECIES_BG_CLASSES[pt.assignedSpecies.toLowerCase()] || SPECIES_BG_CLASSES.unknown;

                  return (
                    <tr key={pt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-slate-400">#{pt.id}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] capitalize border ${trueClass}`}>
                          {pt.trueSpecies}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-white"
                          style={{ backgroundColor: getClusterColor(pt.predictedCluster) }}
                        >
                          Cluster {pt.predictedCluster}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] capitalize border ${assignedClass}`}>
                          {pt.assignedSpecies}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">
                        [{pt.sepalLength}, {pt.sepalWidth}, {pt.petalLength}, {pt.petalWidth}] cm
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Auto-Generated Findings Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-300">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-bold">{findings.title}</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {findings.highlights.map((h, i) => (
            <p key={i} className="font-medium text-slate-900 dark:text-white">
              • {h}
            </p>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-blue-700 dark:text-blue-300 block">
                1. Setosa Pure Separation
              </span>
              <p>{findings.setosaAnalysis}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                2. Versicolor & Virginica Boundary
              </span>
              <p>{findings.overlapAnalysis}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                3. Feature Scaling Effect
              </span>
              <p>{findings.scalingImpact}</p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-purple-700 dark:text-purple-300 block">
                4. PCA Dimensionality Retention
              </span>
              <p>{findings.pcaSummary}</p>
            </div>
          </div>

          <p className="pt-2 italic text-slate-500 dark:text-slate-400 border-t border-blue-200/50 dark:border-slate-700">
            {findings.conclusion}
          </p>
        </div>
      </div>
    </div>
  );
};
