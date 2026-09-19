/**
 * Sidebar Control Panel Component
 * Controls: k slider, seed input, scaling toggle, Run button, dataset switch, theme toggle
 */

import React from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Sun,
  Moon,
  Database,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { ActiveTab, KMeansResult, ComparisonMetrics } from '../types';

interface SidebarProps {
  k: number;
  setK: (k: number) => void;
  seed: number;
  setSeed: (seed: number) => void;
  scalingEnabled: boolean;
  setScalingEnabled: (enabled: boolean) => void;
  onRun: () => void;
  isCalculating: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isCustomDataset: boolean;
  onResetDataset: () => void;
  kmeansResult: KMeansResult | null;
  metrics: ComparisonMetrics | null;
  totalRecords: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  k,
  setK,
  seed,
  setSeed,
  scalingEnabled,
  setScalingEnabled,
  onRun,
  isCalculating,
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
  isCustomDataset,
  onResetDataset,
  kmeansResult,
  metrics,
  totalRecords
}) => {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'dataset', label: 'Dataset', icon: '📊' },
    { id: 'preprocessing', label: 'Preprocessing', icon: '⚙️' },
    { id: 'kmeans', label: 'K-Means', icon: '🎯' },
    { id: 'elbow', label: 'Elbow Method', icon: '📈' },
    { id: 'pca', label: 'PCA & Scatter', icon: '🔍' },
    { id: 'comparison', label: 'Comparison', icon: '⚖️' },
    { id: 'predict', label: 'Predict & Model', icon: '🚀' }
  ];

  return (
    <aside
      id="sidebar-control-panel"
      className="w-full lg:w-72 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0"
    >
      {/* App Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
              Iris Clustering
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unsupervised ML Studio
            </p>
          </div>
        </div>
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Tabs (Mobile horizontal scroll / Desktop vertical stack) */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto lg:overflow-x-visible">
        <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left w-full ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ML Hyperparameters Control Form */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>Parameters</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            {totalRecords} samples
          </span>
        </div>

        {/* k Clusters Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="k-slider" className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              Clusters (k)
              <span className="text-slate-400 text-[11px]" title="Default 3 matching true Iris species">ℹ️</span>
            </label>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60">
              k = {k}
            </span>
          </div>
          <input
            id="k-slider"
            type="range"
            min="2"
            max="10"
            step="1"
            value={k}
            onChange={(e) => setK(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>2</span>
            <span className="font-semibold text-blue-500">3 (Iris)</span>
            <span>6</span>
            <span>10</span>
          </div>
        </div>

        {/* Random Seed Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="seed-input" className="font-medium text-slate-700 dark:text-slate-300">
              Random Seed
            </label>
            <button
              id="randomize-seed-btn"
              type="button"
              onClick={() => setSeed(Math.floor(Math.random() * 1000))}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Randomize
            </button>
          </div>
          <input
            id="seed-input"
            type="number"
            min="0"
            max="99999"
            value={seed}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setSeed(isNaN(val) ? 0 : Math.max(0, val));
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <p className="text-[10px] text-slate-400">
            Fixes PRNG for 100% reproducible k-means++ centroid initialization.
          </p>
        </div>

        {/* StandardScaler Toggle */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              StandardScaler
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="scaling-toggle"
                type="checkbox"
                checked={scalingEnabled}
                onChange={(e) => setScalingEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {scalingEnabled ? 'z = (x - μ) / σ (Active)' : 'Raw measurements (cm)'}
          </p>
        </div>

        {/* Run Button */}
        <button
          id="run-kmeans-btn"
          type="button"
          onClick={onRun}
          disabled={isCalculating}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Computing ML...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Clustering</span>
            </>
          )}
        </button>

        {/* Dataset Status Banner */}
        {isCustomDataset && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Custom CSV loaded</span>
            </div>
            <button
              id="reset-dataset-btn"
              onClick={onResetDataset}
              className="text-[11px] underline text-amber-700 dark:text-amber-300 hover:text-amber-900 text-left font-semibold"
            >
              Reset to 150 Iris rows
            </button>
          </div>
        )}

        {/* Quick Performance Badge */}
        {kmeansResult && metrics && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Current Run Stats
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {metrics.accuracy}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Silhouette</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {metrics.silhouetteScore}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Inertia</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                  {kmeansResult.inertia.toFixed(1)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Iterations</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {kmeansResult.iterations}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>K-Means++ & PCA</span>
        <span className="font-mono">Client-side TS</span>
      </div>
    </aside>
  );
};
