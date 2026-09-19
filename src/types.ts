/**
 * Types and interfaces for the Iris Flower Clustering Project
 */

export interface IrisRecord {
  id: number;
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
  species: 'setosa' | 'versicolor' | 'virginica' | string;
}

export type FeatureKey = 'sepalLength' | 'sepalWidth' | 'petalLength' | 'petalWidth';

export interface FeatureStats {
  feature: FeatureKey;
  label: string;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

export interface ScalerParams {
  means: number[];
  stds: number[];
  enabled: boolean;
}

export interface KMeansResult {
  k: number;
  seed: number;
  centroids: number[][]; // Coordinates in current working space (scaled or raw)
  rawCentroids: number[][]; // Centroids mapped back to original raw feature space
  clusters: number[]; // Cluster assignment index per sample (0 to k-1)
  inertia: number; // Sum of squared distances to closest centroid
  iterations: number;
  converged: boolean;
}

export interface ElbowPoint {
  k: number;
  inertia: number;
  silhouette: number;
}

export interface PCAResult {
  eigenvalues: number[];
  eigenvectors: number[][]; // 4x4 matrix, eigenvectors as columns
  explainedVarianceRatio: number[];
  cumulativeVariance: number[];
  transformedData: {
    id: number;
    pc1: number;
    pc2: number;
    cluster: number;
    species: string;
    sepalLength: number;
    sepalWidth: number;
    petalLength: number;
    petalWidth: number;
  }[];
  projectedCentroids: {
    cluster: number;
    pc1: number;
    pc2: number;
  }[];
  means: number[];
  stds: number[];
}

export interface MisclassifiedPoint {
  id: number;
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
  trueSpecies: string;
  predictedCluster: number;
  assignedSpecies: string;
}

export interface ComparisonMetrics {
  clusterToSpeciesMap: Record<number, string>;
  speciesList: string[];
  clustersList: number[];
  confusionMatrix: number[][]; // rows: trueSpecies index, cols: cluster index
  accuracy: number;
  adjustedRandIndex: number;
  silhouetteScore: number;
  misclassifiedPoints: MisclassifiedPoint[];
  totalPoints: number;
  misclassifiedCount: number;
}

export interface ExportedModel {
  format: 'iris-ml-cluster-model';
  version: '1.0';
  timestamp: string;
  k: number;
  seed: number;
  scalingEnabled: boolean;
  featureNames: string[];
  scaler: {
    means: number[];
    stds: number[];
  };
  centroids: number[][]; // in scaled or raw feature space according to scalingEnabled
  rawCentroids: number[][];
  pca: {
    eigenvectors: number[][]; // 4x4
    means: number[];
    stds: number[];
  };
  clusterToSpeciesMap: Record<number, string>;
}

export type ActiveTab = 'dataset' | 'preprocessing' | 'kmeans' | 'elbow' | 'pca' | 'comparison' | 'predict';
