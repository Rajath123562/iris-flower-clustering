/**
 * K-Means Clustering implementation from scratch
 * Features:
 * - k-means++ smart centroid initialization
 * - Seeded Mulberry32 random number generator for exact reproducibility
 * - Lloyd's optimization algorithm with convergence check
 * - Inertia (Within-Cluster Sum of Squares) calculation
 */

import { SeededRandom } from './random';
import { KMeansResult, ScalerParams } from '../types';
import { StandardScaler } from './scaler';

/**
 * Calculates squared Euclidean distance between two vectors
 */
export function squaredEuclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

/**
 * Calculates Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(squaredEuclideanDistance(a, b));
}

/**
 * Performs k-means++ initialization
 * Arthur & Vassilvitskii (2007)
 */
function initializeCentroidsKMeansPlusPlus(
  data: number[][],
  k: number,
  rng: SeededRandom
): number[][] {
  const n = data.length;
  if (n === 0) return [];
  if (k >= n) return data.map((pt) => [...pt]);

  const centroids: number[][] = [];

  // Step 1: Choose first centroid uniformly at random
  const firstIdx = rng.nextInt(0, n - 1);
  centroids.push([...data[firstIdx]]);

  // Distances array storing min squared distance of each point to nearest chosen centroid
  const minDistSq = new Array(n).fill(Infinity);

  // Step 2-4: Select remaining k - 1 centroids
  for (let c = 1; c < k; c++) {
    const latestCentroid = centroids[c - 1];
    let sumDistSq = 0;

    for (let i = 0; i < n; i++) {
      const d2 = squaredEuclideanDistance(data[i], latestCentroid);
      if (d2 < minDistSq[i]) {
        minDistSq[i] = d2;
      }
      sumDistSq += minDistSq[i];
    }

    // Weighted random selection proportional to D(x)^2
    const target = rng.next() * sumDistSq;
    let cumulative = 0;
    let selectedIdx = n - 1;

    for (let i = 0; i < n; i++) {
      cumulative += minDistSq[i];
      if (cumulative >= target) {
        selectedIdx = i;
        break;
      }
    }

    centroids.push([...data[selectedIdx]]);
  }

  return centroids;
}

/**
 * Finds the index of the nearest centroid for a given point
 */
export function findNearestCentroid(point: number[], centroids: number[][]): { cluster: number; distSq: number } {
  let minCluster = 0;
  let minDistSq = Infinity;

  for (let c = 0; c < centroids.length; c++) {
    const d2 = squaredEuclideanDistance(point, centroids[c]);
    if (d2 < minDistSq) {
      minDistSq = d2;
      minCluster = c;
    }
  }

  return { cluster: minCluster, distSq: minDistSq };
}

/**
 * Runs K-Means clustering algorithm
 */
export function runKMeans(
  data: number[][],
  k: number,
  seed: number = 42,
  maxIterations: number = 300,
  tolerance: number = 1e-6,
  scalerParams?: ScalerParams
): KMeansResult {
  const n = data.length;
  if (n === 0 || k <= 0) {
    return {
      k,
      seed,
      centroids: [],
      rawCentroids: [],
      clusters: [],
      inertia: 0,
      iterations: 0,
      converged: true
    };
  }

  const numFeatures = data[0].length;
  const clampedK = Math.min(k, n);
  const rng = new SeededRandom(seed);

  // Initialize centroids with k-means++
  let centroids = initializeCentroidsKMeansPlusPlus(data, clampedK, rng);
  const clusters = new Array<number>(n).fill(0);

  let iterations = 0;
  let converged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let changed = false;

    // Assignment step
    for (let i = 0; i < n; i++) {
      const nearest = findNearestCentroid(data[i], centroids);
      if (clusters[i] !== nearest.cluster) {
        clusters[i] = nearest.cluster;
        changed = true;
      }
    }

    // Update step: recalculate centroids
    const newCentroids: number[][] = Array.from({ length: clampedK }, () => new Array(numFeatures).fill(0));
    const counts = new Array<number>(clampedK).fill(0);

    for (let i = 0; i < n; i++) {
      const c = clusters[i];
      counts[c]++;
      for (let j = 0; j < numFeatures; j++) {
        newCentroids[c][j] += data[i][j];
      }
    }

    // Handle any empty clusters (re-assign to point furthest from its assigned centroid)
    for (let c = 0; c < clampedK; c++) {
      if (counts[c] === 0) {
        let maxDist = -1;
        let furthestPointIdx = 0;
        for (let i = 0; i < n; i++) {
          const d = squaredEuclideanDistance(data[i], centroids[clusters[i]]);
          if (d > maxDist) {
            maxDist = d;
            furthestPointIdx = i;
          }
        }
        newCentroids[c] = [...data[furthestPointIdx]];
      } else {
        for (let j = 0; j < numFeatures; j++) {
          newCentroids[c][j] /= counts[c];
        }
      }
    }

    // Convergence check: maximum displacement of any centroid
    let maxShift = 0;
    for (let c = 0; c < clampedK; c++) {
      const shift = euclideanDistance(centroids[c], newCentroids[c]);
      if (shift > maxShift) {
        maxShift = shift;
      }
    }

    centroids = newCentroids;

    if (!changed || maxShift < tolerance) {
      converged = true;
      break;
    }
  }

  // Calculate final inertia (Within-Cluster Sum of Squares)
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    inertia += squaredEuclideanDistance(data[i], centroids[clusters[i]]);
  }

  // If scaler params are provided, compute raw centroids
  const rawCentroids = scalerParams && scalerParams.enabled
    ? StandardScaler.inverseTransform(centroids, scalerParams)
    : centroids.map((c) => [...c]);

  return {
    k: clampedK,
    seed,
    centroids,
    rawCentroids,
    clusters,
    inertia: Number(inertia.toFixed(4)),
    iterations,
    converged
  };
}
