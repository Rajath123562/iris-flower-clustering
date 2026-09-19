/**
 * Iris Flower Clustering Project - Main Application
 * Single-page web app demonstrating unsupervised ML on the Iris dataset:
 * - Full 150-row Iris dataset + custom CSV upload
 * - StandardScaler (z-score) with toggle
 * - K-Means from scratch with k-means++ and seeded PRNG
 * - Elbow method (k = 1 to 10) + Silhouette score
 * - PCA from scratch with Jacobi Eigen Decomposition
 * - Predicted vs True comparison, confusion matrix heatmap, ARI, and findings
 * - Model Save / Load JSON & live flower prediction
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RAW_IRIS_DATASET,
  calculateFeatureStats,
  extractFeatureMatrix
} from './data/irisData';
import { StandardScaler } from './ml/scaler';
import { runKMeans } from './ml/kmeans';
import { fitPCA } from './ml/pca';
import {
  evaluateClustering,
  computeElbowMethod,
  calculateSilhouetteScore
} from './ml/metrics';
import {
  ActiveTab,
  IrisRecord,
  ScalerParams,
  KMeansResult,
  PCAResult,
  ComparisonMetrics,
  ElbowPoint,
  ExportedModel
} from './types';
import { Sidebar } from './components/Sidebar';
import { DatasetTab } from './components/DatasetTab';
import { PreprocessingTab } from './components/PreprocessingTab';
import { KMeansTab } from './components/KMeansTab';
import { ElbowTab } from './components/ElbowTab';
import { PcaTab } from './components/PcaTab';
import { ComparisonTab } from './components/ComparisonTab';
import { PredictTab } from './components/PredictTab';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dataset');

  // Dataset state
  const [dataset, setDataset] = useState<IrisRecord[]>(RAW_IRIS_DATASET);
  const [isCustomDataset, setIsCustomDataset] = useState<boolean>(false);

  // ML Hyperparameters
  const [k, setK] = useState<number>(3);
  const [seed, setSeed] = useState<number>(42);
  const [scalingEnabled, setScalingEnabled] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Computed feature stats
  const featureStats = useMemo(() => calculateFeatureStats(dataset), [dataset]);

  // Fitted Scaler parameters
  const scalerParams: ScalerParams = useMemo(() => {
    const rawMatrix = extractFeatureMatrix(dataset);
    const { means, stds } = StandardScaler.fit(rawMatrix);
    return {
      means,
      stds,
      enabled: scalingEnabled
    };
  }, [dataset, scalingEnabled]);

  // Model States
  const [kmeansResult, setKmeansResult] = useState<KMeansResult | null>(null);
  const [pcaResult, setPcaResult] = useState<PCAResult | null>(null);
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const [elbowData, setElbowData] = useState<ElbowPoint[]>([]);

  // Core ML computation runner
  const runModel = useCallback(() => {
    setIsCalculating(true);

    // Timeout allows DOM to render loading spinner smoothly
    setTimeout(() => {
      try {
        const rawMatrix = extractFeatureMatrix(dataset);
        const workingMatrix = StandardScaler.transform(rawMatrix, scalerParams);

        // Run K-Means
        const kmRes = runKMeans(workingMatrix, k, seed, 300, 1e-6, scalerParams);

        // Run PCA
        const pcaRes = fitPCA(workingMatrix, dataset, kmRes.clusters, kmRes.centroids);

        // Compute silhouette score
        const silScore = k >= 2 ? calculateSilhouetteScore(workingMatrix, kmRes.clusters, k) : 0;

        // Evaluate clustering vs ground truth species
        const compMetrics = evaluateClustering(dataset, kmRes.clusters, k, silScore);

        // Compute Elbow Curve for k = 1 to 10
        const elbowRes = computeElbowMethod(workingMatrix, seed, scalerParams);

        setKmeansResult(kmRes);
        setPcaResult(pcaRes);
        setMetrics(compMetrics);
        setElbowData(elbowRes);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  }, [dataset, k, seed, scalerParams]);

  // Re-run model when hyperparameters or dataset changes
  useEffect(() => {
    runModel();
  }, [runModel]);

  // Upload custom CSV
  const handleUploadCsv = (records: IrisRecord[]) => {
    setDataset(records);
    setIsCustomDataset(true);
    setActiveTab('dataset');
  };

  // Reset to default Fisher 150 Iris rows
  const handleResetDataset = () => {
    setDataset(RAW_IRIS_DATASET);
    setIsCustomDataset(false);
  };

  // Import trained model JSON
  const handleImportModel = (imported: ExportedModel) => {
    setK(imported.k);
    setSeed(imported.seed);
    setScalingEnabled(imported.scalingEnabled);
    setActiveTab('predict');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-150">
      {/* Left Sticky/Fixed Sidebar */}
      <Sidebar
        k={k}
        setK={setK}
        seed={seed}
        setSeed={setSeed}
        scalingEnabled={scalingEnabled}
        setScalingEnabled={setScalingEnabled}
        onRun={runModel}
        isCalculating={isCalculating}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        isCustomDataset={isCustomDataset}
        onResetDataset={handleResetDataset}
        kmeansResult={kmeansResult}
        metrics={metrics}
        totalRecords={dataset.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar / Breadcrumb Header */}
        <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Module
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
              {activeTab === 'elbow'
                ? 'Elbow Method (k=1..10)'
                : activeTab === 'pca'
                ? 'PCA Projections & Scatter'
                : activeTab === 'predict'
                ? 'Live Prediction & Model'
                : activeTab}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine: Client-Side TypeScript</span>
            </div>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {activeTab === 'dataset' && (
            <DatasetTab
              dataset={dataset}
              featureStats={featureStats}
              onUploadCsv={handleUploadCsv}
              isCustomDataset={isCustomDataset}
              onResetToDefault={handleResetDataset}
            />
          )}

          {activeTab === 'preprocessing' && (
            <PreprocessingTab
              scalerParams={scalerParams}
              setScalingEnabled={setScalingEnabled}
              featureStats={featureStats}
              dataset={dataset}
            />
          )}

          {activeTab === 'kmeans' && (
            <KMeansTab
              kmeans={kmeansResult}
              metrics={metrics}
              scalerParams={scalerParams}
              onRerun={runModel}
              seed={seed}
            />
          )}

          {activeTab === 'elbow' && (
            <ElbowTab
              elbowData={elbowData}
              currentK={k}
              onSelectK={setK}
              isCalculating={isCalculating}
            />
          )}

          {activeTab === 'pca' && (
            <PcaTab
              pca={pcaResult}
              kmeans={kmeansResult}
              k={k}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonTab
              metrics={metrics}
              kmeans={kmeansResult}
              pca={pcaResult}
              scalerParams={scalerParams}
            />
          )}

          {activeTab === 'predict' && (
            <PredictTab
              kmeans={kmeansResult}
              pca={pcaResult}
              scalerParams={scalerParams}
              metrics={metrics}
              onImportModel={handleImportModel}
            />
          )}
        </div>
      </main>
    </div>
  );
}
