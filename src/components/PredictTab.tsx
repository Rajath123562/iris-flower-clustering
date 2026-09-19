/**
 * Predict & Model Save/Load Tab Component
 * Features:
 * - 4 interactive sliders/inputs for user flower measurements
 * - Presets for quick evaluation (Typical Setosa, Versicolor, Virginica)
 * - Live real-time cluster and species prediction
 * - Interactive PCA projection scatter showing where the new sample lands
 * - "Export model" button (JSON download)
 * - "Import model" button (JSON upload)
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Sliders,
  Crosshair,
  FileCheck
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  Cell
} from 'recharts';
import {
  KMeansResult,
  PCAResult,
  ScalerParams,
  ComparisonMetrics,
  ExportedModel
} from '../types';
import { StandardScaler } from '../ml/scaler';
import { findNearestCentroid } from '../ml/kmeans';
import { projectPointToPCA } from '../ml/pca';
import { downloadJsonFile, getClusterColor, SPECIES_BG_CLASSES } from '../utils/colors';

interface PredictTabProps {
  kmeans: KMeansResult | null;
  pca: PCAResult | null;
  scalerParams: ScalerParams;
  metrics: ComparisonMetrics | null;
  onImportModel: (imported: ExportedModel) => void;
}

export const PredictTab: React.FC<PredictTabProps> = ({
  kmeans,
  pca,
  scalerParams,
  metrics,
  onImportModel
}) => {
  // 4 flower feature inputs
  const [sepalLength, setSepalLength] = useState<number>(5.8);
  const [sepalWidth, setSepalWidth] = useState<number>(3.0);
  const [petalLength, setPetalLength] = useState<number>(3.8);
  const [petalWidth, setPetalWidth] = useState<number>(1.2);

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Quick preset buttons
  const applyPreset = (sl: number, sw: number, pl: number, pw: number) => {
    setSepalLength(sl);
    setSepalWidth(sw);
    setPetalLength(pl);
    setPetalWidth(pw);
  };

  // Prediction calculation
  const prediction = useMemo(() => {
    if (!kmeans || !pca) return null;

    const rawVector = [sepalLength, sepalWidth, petalLength, petalWidth];

    // Scale if scaling is enabled
    const workingVector = scalerParams.enabled
      ? StandardScaler.transformVector(rawVector, scalerParams)
      : rawVector;

    // Find nearest centroid
    const { cluster, distSq } = findNearestCentroid(workingVector, kmeans.centroids);

    // Project point into PCA space
    const pcaPoint = projectPointToPCA(workingVector, pca.means, pca.eigenvectors);

    // Map to majority species
    const species = metrics?.clusterToSpeciesMap[cluster] || 'Unknown';

    return {
      cluster,
      distance: Math.sqrt(distSq),
      species,
      pc1: pcaPoint.pc1,
      pc2: pcaPoint.pc2
    };
  }, [sepalLength, sepalWidth, petalLength, petalWidth, kmeans, pca, scalerParams, metrics]);

  // Export Model Handler
  const handleExportModel = () => {
    if (!kmeans || !pca) return;

    const exportData: ExportedModel = {
      format: 'iris-ml-cluster-model',
      version: '1.0',
      timestamp: new Date().toISOString(),
      k: kmeans.k,
      seed: kmeans.seed,
      scalingEnabled: scalerParams.enabled,
      featureNames: ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth'],
      scaler: {
        means: scalerParams.means,
        stds: scalerParams.stds
      },
      centroids: kmeans.centroids,
      rawCentroids: kmeans.rawCentroids,
      pca: {
        eigenvectors: pca.eigenvectors,
        means: pca.means,
        stds: pca.stds
      },
      clusterToSpeciesMap: metrics?.clusterToSpeciesMap || {}
    };

    const filename = `iris-kmeans-model-k${kmeans.k}-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(filename, exportData);
  };

  // Import Model Handler
  const handleImportFile = (file: File) => {
    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as ExportedModel;

        if (
          parsed.format !== 'iris-ml-cluster-model' ||
          !Array.isArray(parsed.centroids) ||
          !parsed.pca ||
          !Array.isArray(parsed.pca.eigenvectors)
        ) {
          setImportError('Invalid model file format. Missing required cluster centroids or PCA structures.');
          return;
        }

        onImportModel(parsed);
        setImportSuccess(`Successfully imported model with k = ${parsed.k}!`);
      } catch (err) {
        setImportError(`Failed to parse model JSON: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.onerror = () => {
      setImportError('Error reading uploaded model file.');
    };
    reader.readAsText(file);
  };

  if (!kmeans || !pca || !prediction) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">Preparing inference engine...</p>
      </div>
    );
  }

  // Scatter data with background points and the new query point
  const queryPointData = [
    {
      pc1: prediction.pc1,
      pc2: prediction.pc2,
      name: 'New Flower',
      cluster: prediction.cluster,
      species: prediction.species
    }
  ];

  return (
    <div id="predict-tab-container" className="space-y-8">
      {/* Header & Export / Import Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Live Flower Inference & Model Persistence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test custom flower measurements, inspect PCA landing position, or save/load trained model weights.
          </p>
        </div>

        {/* Export & Import Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="export-model-btn"
            type="button"
            onClick={handleExportModel}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Model (JSON)</span>
          </button>

          <label
            htmlFor="import-model-input"
            className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Model</span>
            <input
              id="import-model-input"
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImportFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Import Status Feedback */}
      {importError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{importError}</span>
        </div>
      )}
      {importSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Main Interactive Inference Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Prediction Result (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Presets */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Quick Botanical Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                id="preset-setosa-btn"
                type="button"
                onClick={() => applyPreset(5.0, 3.5, 1.4, 0.2)}
                className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 text-xs font-medium transition-colors"
              >
                Typical Setosa
              </button>
              <button
                id="preset-versicolor-btn"
                type="button"
                onClick={() => applyPreset(5.9, 2.8, 4.3, 1.3)}
                className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-medium transition-colors"
              >
                Typical Versicolor
              </button>
              <button
                id="preset-virginica-btn"
                type="button"
                onClick={() => applyPreset(6.7, 3.1, 5.7, 2.1)}
                className="px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-medium transition-colors"
              >
                Typical Virginica
              </button>
            </div>
          </div>

          {/* 4 Feature Input Sliders */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-500" />
              Flower Measurement Inputs
            </h3>

            {/* Sepal Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label htmlFor="slider-sepal-length" className="text-slate-700 dark:text-slate-300">
                  Sepal Length
                </label>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {sepalLength.toFixed(1)} cm
                </span>
              </div>
              <input
                id="slider-sepal-length"
                type="range"
                min="4.0"
                max="8.0"
                step="0.1"
                value={sepalLength}
                onChange={(e) => setSepalLength(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>4.0 cm</span>
                <span>6.0 cm</span>
                <span>8.0 cm</span>
              </div>
            </div>

            {/* Sepal Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label htmlFor="slider-sepal-width" className="text-slate-700 dark:text-slate-300">
                  Sepal Width
                </label>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {sepalWidth.toFixed(1)} cm
                </span>
              </div>
              <input
                id="slider-sepal-width"
                type="range"
                min="2.0"
                max="4.5"
                step="0.1"
                value={sepalWidth}
                onChange={(e) => setSepalWidth(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2.0 cm</span>
                <span>3.2 cm</span>
                <span>4.5 cm</span>
              </div>
            </div>

            {/* Petal Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label htmlFor="slider-petal-length" className="text-slate-700 dark:text-slate-300">
                  Petal Length
                </label>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {petalLength.toFixed(1)} cm
                </span>
              </div>
              <input
                id="slider-petal-length"
                type="range"
                min="1.0"
                max="7.0"
                step="0.1"
                value={petalLength}
                onChange={(e) => setPetalLength(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1.0 cm</span>
                <span>4.0 cm</span>
                <span>7.0 cm</span>
              </div>
            </div>

            {/* Petal Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <label htmlFor="slider-petal-width" className="text-slate-700 dark:text-slate-300">
                  Petal Width
                </label>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {petalWidth.toFixed(1)} cm
                </span>
              </div>
              <input
                id="slider-petal-width"
                type="range"
                min="0.1"
                max="2.6"
                step="0.1"
                value={petalWidth}
                onChange={(e) => setPetalWidth(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.1 cm</span>
                <span>1.3 cm</span>
                <span>2.6 cm</span>
              </div>
            </div>
          </div>

          {/* Prediction Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Inference Result
              </span>
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: getClusterColor(prediction.cluster) }}
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-300">Predicted Cluster:</div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <span>Cluster {prediction.cluster}</span>
                <span className="text-sm font-normal text-slate-400">
                  (of {kmeans.k})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Mapped Species</span>
                <span className="text-base font-bold capitalize text-emerald-400">
                  Iris-{prediction.species}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Centroid Distance</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {prediction.distance.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PCA Scatter Plot with Highlighted New Point (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-rose-500" />
                Live Projection onto PCA 2D Space
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The red pulsing beacon (🔴) shows exactly where your custom flower coordinates map in 2D.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              PC1: {prediction.pc1} | PC2: {prediction.pc2}
            </div>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  type="number"
                  dataKey="pc1"
                  name="PC1"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'PC1 (Petal variance)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="pc2"
                  name="PC2"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'PC2 (Sepal variance)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11 }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      const isNew = pt.name === 'New Flower';
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs space-y-1 shadow-lg border border-slate-800">
                          <p className={`font-bold ${isNew ? 'text-rose-400' : 'text-blue-300'}`}>
                            {isNew ? '★ Your Custom Flower' : `Cluster ${pt.cluster}`}
                          </p>
                          <p className="text-slate-300 capitalize">
                            Species: {pt.species || 'Unknown'}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            PC1: {pt.pc1} | PC2: {pt.pc2}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />

                {/* Background dataset points */}
                <Scatter
                  name="Dataset Samples"
                  data={pca.transformedData}
                  fill="#94a3b8"
                  opacity={0.4}
                />

                {/* Projected Centroids */}
                <Scatter
                  name="Centroids (★)"
                  data={pca.projectedCentroids}
                  fill="#0f172a"
                  shape="star"
                />

                {/* The New Flower Query Point */}
                <Scatter
                  name="Custom Query Flower"
                  data={queryPointData}
                  fill="#ef4444"
                  shape="circle"
                >
                  <Cell fill="#ef4444" stroke="#ffffff" strokeWidth={3} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              Projection Explanation:
            </span>
            The 4 sliders construct a vector <code>x = [SL, SW, PL, PW]</code>. If StandardScaler is enabled, it is normalized to <code>z</code>, and projected via the saved eigenvectors: <code>PC = (x - μ) · V</code>. The flower is assigned to the nearest centroid in Euclidean space.
          </div>
        </div>
      </div>
    </div>
  );
};
