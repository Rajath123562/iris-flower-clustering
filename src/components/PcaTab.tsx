/**
 * PCA Dimensionality Reduction & Scatter Visualizations Tab
 * Includes:
 * 1. Scree Plot (Explained Variance Ratio & Cumulative Variance)
 * 2. Eigenvectors / Loadings Matrix
 * 3. Side-by-side PCA Scatter plots (Predicted Cluster vs True Species)
 * 4. Pairwise Feature Scatter Plot with X/Y dropdown selectors
 * 5. Explanations under each chart
 */

import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  BarChart2,
  Maximize2,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  Cell
} from 'recharts';
import { PCAResult, FeatureKey, KMeansResult } from '../types';
import { FEATURE_NAMES } from '../data/irisData';
import { getClusterColor, getSpeciesColor, SPECIES_COLORS, CLUSTER_COLORS } from '../utils/colors';

interface PcaTabProps {
  pca: PCAResult | null;
  kmeans: KMeansResult | null;
  k: number;
}

export const PcaTab: React.FC<PcaTabProps> = ({ pca, kmeans, k }) => {
  const [featureX, setFeatureX] = useState<FeatureKey>('petalLength');
  const [featureY, setFeatureY] = useState<FeatureKey>('petalWidth');

  if (!pca || !kmeans) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">Calculating PCA and cluster projections...</p>
      </div>
    );
  }

  // Scree plot data
  const screeData = pca.explainedVarianceRatio.map((ratio, i) => ({
    name: `PC${i + 1}`,
    varianceRatio: Number((ratio * 100).toFixed(1)),
    cumulativeVariance: Number((pca.cumulativeVariance[i] * 100).toFixed(1))
  }));

  // Separate PCA scatter data by cluster for predicted scatter
  const clusterScatterGroups = Array.from({ length: k }, (_, cIdx) => {
    return {
      cluster: cIdx,
      color: getClusterColor(cIdx),
      points: pca.transformedData.filter((d) => d.cluster === cIdx)
    };
  });

  // Separate PCA scatter data by species for true species scatter
  const speciesList = ['setosa', 'versicolor', 'virginica'];
  const speciesScatterGroups = speciesList.map((sp) => ({
    species: sp,
    color: getSpeciesColor(sp),
    points: pca.transformedData.filter((d) => d.species.toLowerCase() === sp)
  }));

  // Feature selector options
  const featureOptions = FEATURE_NAMES.map((f) => ({
    key: f.key,
    label: f.label
  }));

  const featureXMeta = FEATURE_NAMES.find((f) => f.key === featureX) || FEATURE_NAMES[2];
  const featureYMeta = FEATURE_NAMES.find((f) => f.key === featureY) || FEATURE_NAMES[3];

  const featureIdxMap: Record<FeatureKey, number> = {
    sepalLength: 0,
    sepalWidth: 1,
    petalLength: 2,
    petalWidth: 3
  };

  // Centroid coordinates for pairwise plot
  const pairwiseCentroids = kmeans.rawCentroids.map((c, cIdx) => ({
    cluster: cIdx,
    x: c[featureIdxMap[featureX]],
    y: c[featureIdxMap[featureY]]
  }));

  return (
    <div id="pca-tab-container" className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-600" />
          Principal Component Analysis (PCA) & Visualizations
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Projects 4-dimensional flower data down to 2 principal axes using Jacobi Eigen Decomposition.
        </p>
      </div>

      {/* SECTION 1: PCA Variance & Scree Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scree Plot Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              Scree Plot (Explained Variance & Cumulative Curve)
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
              PC1+PC2: {(pca.cumulativeVariance[1] * 100).toFixed(1)}% Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={screeData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Variance Ratio (%)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Cumulative (%)', angle: 90, position: 'insideRight', fontSize: 11 }}
                />
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
                <Bar
                  yAxisId="left"
                  dataKey="varianceRatio"
                  name="Individual Explained Variance (%)"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeVariance"
                  name="Cumulative Variance (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            PC1 captures {(pca.explainedVarianceRatio[0] * 100).toFixed(1)}% and PC2 captures {(pca.explainedVarianceRatio[1] * 100).toFixed(1)}% of all variance in the 4-dimensional space. Over 95% of information is retained when reducing to 2D.
          </p>
        </div>

        {/* Eigenvector Loadings Matrix */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Component Loadings (Eigenvectors)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Linear weights of each original feature in the principal components.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-sans">
                <tr>
                  <th className="py-2 px-2">Feature</th>
                  <th className="py-2 px-2 text-blue-600 dark:text-blue-400">PC1</th>
                  <th className="py-2 px-2 text-emerald-600 dark:text-emerald-400">PC2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {FEATURE_NAMES.map((f, i) => (
                  <tr key={f.key}>
                    <td className="py-2 px-2 font-sans font-medium text-slate-700 dark:text-slate-300">
                      {f.label}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">
                      {pca.eigenvectors[i][0].toFixed(3)}
                    </td>
                    <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                      {pca.eigenvectors[i][1].toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400">
            <strong>Key Insight:</strong> Petal dimensions carry the heaviest weights in PC1, while Sepal Width dominates PC2.
          </div>
        </div>
      </div>

      {/* SECTION 2: Side-by-Side PCA Scatter Plots */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-blue-500" />
            Side-by-Side PCA Projections: Predicted Clusters vs. True Species
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare how unsupervised K-Means clusters (left) match the true biological ground-truth species (right).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plot A: Predicted Clusters in PCA Space with Centroids */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Plot A: Colored by Predicted Cluster (k = {k})
              </h4>
              <span className="text-[11px] text-slate-400">Centroids marked with ★</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    type="number"
                    dataKey="pc1"
                    name="PC1"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="pc2"
                    name="PC2"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11 }}
                  />
                  <ZAxis range={[50, 50]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 shadow-lg border border-slate-800">
                            <p className="font-bold text-blue-300">
                              {pt.cluster !== undefined ? `Cluster ${pt.cluster}` : 'Point'} (ID #{pt.id})
                            </p>
                            <p className="text-slate-300 capitalize">True Species: {pt.species}</p>
                            <div className="font-mono text-[11px] text-slate-400">
                              <p>PC1: {pt.pc1} | PC2: {pt.pc2}</p>
                              <p>Sepal: {pt.sepalLength} × {pt.sepalWidth} cm</p>
                              <p>Petal: {pt.petalLength} × {pt.petalWidth} cm</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />

                  {/* Scatter series per cluster */}
                  {clusterScatterGroups.map((group) => (
                    <Scatter
                      key={group.cluster}
                      name={`Cluster ${group.cluster}`}
                      data={group.points}
                      fill={group.color}
                    />
                  ))}

                  {/* Centroids scatter */}
                  <Scatter
                    name="Centroids"
                    data={pca.projectedCentroids}
                    fill="#111827"
                    shape="star"
                  >
                    {pca.projectedCentroids.map((entry, index) => (
                      <Cell key={`centroid-${index}`} fill="#0f172a" stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Chart A Explanation:
              </span>
              Data points are mapped onto the 2D PCA plane and colored by the cluster index assigned by K-Means. Centroids (★) represent the projected multi-dimensional center for each cluster.
            </div>
          </div>

          {/* Plot B: Colored by True Species in PCA Space */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Plot B: Colored by True Biological Species
              </h4>
              <span className="text-[11px] text-slate-400">Ground Truth</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    type="number"
                    dataKey="pc1"
                    name="PC1"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="pc2"
                    name="PC2"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11 }}
                  />
                  <ZAxis range={[50, 50]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 shadow-lg border border-slate-800">
                            <p className="font-bold text-emerald-300 capitalize">
                              Iris-{pt.species} (ID #{pt.id})
                            </p>
                            <p className="text-slate-300">Assigned Cluster: Cluster {pt.cluster}</p>
                            <div className="font-mono text-[11px] text-slate-400">
                              <p>PC1: {pt.pc1} | PC2: {pt.pc2}</p>
                              <p>Sepal: {pt.sepalLength} × {pt.sepalWidth} cm</p>
                              <p>Petal: {pt.petalLength} × {pt.petalWidth} cm</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />

                  {/* Scatter series per true species */}
                  {speciesScatterGroups.map((group) => (
                    <Scatter
                      key={group.species}
                      name={`Iris-${group.species}`}
                      data={group.points}
                      fill={group.color}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Chart B Explanation:
              </span>
              The identical PCA coordinate system colored by true botanical species. Setosa (blue) forms an isolated island on the left, whereas Versicolor (green) and Virginica (purple) meet closely along the middle boundary.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Pairwise Feature Selector Scatter Plot */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-500" />
              Pairwise Feature Scatter Plot (Colored by Cluster)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect any 2 original morphological dimensions (e.g. Petal Length vs. Petal Width).
            </p>
          </div>

          {/* Feature Dropdown Selectors */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">X-Axis:</span>
              <select
                id="select-feature-x"
                value={featureX}
                onChange={(e) => setFeatureX(e.target.value as FeatureKey)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                {featureOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Y-Axis:</span>
              <select
                id="select-feature-y"
                value={featureY}
                onChange={(e) => setFeatureY(e.target.value as FeatureKey)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                {featureOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis
                type="number"
                dataKey={featureX}
                name={featureXMeta.label}
                tick={{ fontSize: 11 }}
                label={{
                  value: `${featureXMeta.label} (${featureXMeta.unit})`,
                  position: 'insideBottom',
                  offset: -10,
                  fontSize: 11
                }}
              />
              <YAxis
                type="number"
                dataKey={featureY}
                name={featureYMeta.label}
                tick={{ fontSize: 11 }}
                label={{
                  value: `${featureYMeta.label} (${featureYMeta.unit})`,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fontSize: 11
                }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 shadow-lg border border-slate-800">
                        <p className="font-bold text-amber-300">
                          Cluster {pt.cluster} (ID #{pt.id})
                        </p>
                        <p className="text-slate-300 capitalize">Species: {pt.species}</p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {featureXMeta.label}: {pt[featureX]} cm
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {featureYMeta.label}: {pt[featureY]} cm
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />

              {/* Data points per cluster */}
              {clusterScatterGroups.map((group) => (
                <Scatter
                  key={group.cluster}
                  name={`Cluster ${group.cluster}`}
                  data={group.points}
                  fill={group.color}
                />
              ))}

              {/* Centroids marked in feature space */}
              <Scatter
                name="Cluster Centroids"
                data={pairwiseCentroids}
                fill="#000000"
                shape="cross"
              >
                {pairwiseCentroids.map((entry, index) => (
                  <Cell key={`pairwise-centroid-${index}`} fill="#0f172a" stroke="#ffffff" strokeWidth={2} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
            Pairwise Visualization Explanation:
          </span>
          Examining <strong>{featureXMeta.label}</strong> vs. <strong>{featureYMeta.label}</strong> highlights direct biological correlations. Notice how Petal Length vs. Petal Width provides the clearest visual cluster separation, matching Ronald Fisher’s findings.
        </div>
      </div>
    </div>
  );
};
