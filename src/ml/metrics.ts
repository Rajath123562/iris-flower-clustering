/**
 * Machine Learning Evaluation Metrics:
 * - Silhouette Score (cluster cohesion vs separation)
 * - Adjusted Rand Index (ARI - permutation invariant clustering agreement)
 * - Majority Species Mapping & Confusion Matrix
 * - Misclassified sample identification
 * - Elbow Method (k = 1 to 10 inertia and silhouette curves)
 */

import { euclideanDistance, runKMeans } from './kmeans';
import { ComparisonMetrics, ElbowPoint, IrisRecord, MisclassifiedPoint, ScalerParams } from '../types';

/**
 * Calculates the average Silhouette Score for clustered data
 * Range: -1 (poor) to +1 (excellent)
 */
export function calculateSilhouetteScore(data: number[][], clusters: number[], k: number): number {
  const n = data.length;
  if (n <= 1 || k <= 1 || k >= n) return 0;

  // Group indices by cluster
  const clusterIndices: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) {
    clusterIndices[clusters[i]].push(i);
  }

  // Pre-calculate pairwise distances
  const distMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = euclideanDistance(data[i], data[j]);
      distMatrix[i][j] = d;
      distMatrix[j][i] = d;
    }
  }

  let totalScore = 0;
  let validPoints = 0;

  for (let i = 0; i < n; i++) {
    const c_i = clusters[i];
    const ownCluster = clusterIndices[c_i];

    if (ownCluster.length <= 1) {
      // Isolated point in cluster
      continue;
    }

    // a(i): mean intra-cluster distance
    let a_i = 0;
    for (const otherIdx of ownCluster) {
      if (otherIdx !== i) {
        a_i += distMatrix[i][otherIdx];
      }
    }
    a_i /= (ownCluster.length - 1);

    // b(i): minimum mean inter-cluster distance
    let b_i = Infinity;
    for (let otherC = 0; otherC < k; otherC++) {
      if (otherC === c_i) continue;
      const targetCluster = clusterIndices[otherC];
      if (targetCluster.length === 0) continue;

      let sumDist = 0;
      for (const targetIdx of targetCluster) {
        sumDist += distMatrix[i][targetIdx];
      }
      const meanDist = sumDist / targetCluster.length;
      if (meanDist < b_i) {
        b_i = meanDist;
      }
    }

    const s_i = (b_i - a_i) / Math.max(a_i, b_i);
    totalScore += s_i;
    validPoints++;
  }

  return validPoints > 0 ? Number((totalScore / validPoints).toFixed(4)) : 0;
}

/**
 * Binomial coefficient n choose 2 = n * (n - 1) / 2
 */
function comb2(n: number): number {
  return n >= 2 ? (n * (n - 1)) / 2 : 0;
}

/**
 * Calculates Adjusted Rand Index (ARI)
 * Range: -1 to +1 (1 is perfect clustering match with ground truth)
 */
export function calculateAdjustedRandIndex(trueLabels: string[], predClusters: number[]): number {
  const n = trueLabels.length;
  if (n === 0) return 0;

  const uniqueClasses = Array.from(new Set(trueLabels));
  const uniqueClusters = Array.from(new Set(predClusters));

  const numClasses = uniqueClasses.length;
  const numClusters = uniqueClusters.length;

  const classMap = new Map(uniqueClasses.map((cls, idx) => [cls, idx]));
  const clusterMap = new Map(uniqueClusters.map((c, idx) => [c, idx]));

  // Contingency matrix
  const contingency: number[][] = Array.from({ length: numClasses }, () => new Array(numClusters).fill(0));
  const a: number[] = new Array(numClasses).fill(0); // row sums
  const b: number[] = new Array(numClusters).fill(0); // col sums

  for (let i = 0; i < n; i++) {
    const r = classMap.get(trueLabels[i])!;
    const c = clusterMap.get(predClusters[i])!;
    contingency[r][c]++;
    a[r]++;
    b[c]++;
  }

  let sumCombNij = 0;
  for (let r = 0; r < numClasses; r++) {
    for (let c = 0; c < numClusters; c++) {
      sumCombNij += comb2(contingency[r][c]);
    }
  }

  let sumCombA = 0;
  for (let r = 0; r < numClasses; r++) {
    sumCombA += comb2(a[r]);
  }

  let sumCombB = 0;
  for (let c = 0; c < numClusters; c++) {
    sumCombB += comb2(b[c]);
  }

  const combTotal = comb2(n);
  if (combTotal === 0) return 0;

  const expectedIndex = (sumCombA * sumCombB) / combTotal;
  const maxIndex = 0.5 * (sumCombA + sumCombB);

  const denominator = maxIndex - expectedIndex;
  if (denominator === 0) {
    return sumCombNij === expectedIndex ? 1.0 : 0.0;
  }

  const ari = (sumCombNij - expectedIndex) / denominator;
  return Number(ari.toFixed(4));
}

/**
 * Computes confusion matrix, majority species assignment, accuracy, and misclassified points
 */
export function evaluateClustering(
  dataset: IrisRecord[],
  clusters: number[],
  k: number,
  silhouetteScore: number
): ComparisonMetrics {
  const n = dataset.length;
  const trueSpeciesList = Array.from(new Set(dataset.map((d) => d.species))).sort();
  const clustersList = Array.from({ length: k }, (_, i) => i);

  // Contingency matrix: rows = trueSpecies, cols = cluster
  // matrix[row][col] is count of samples with species row in cluster col
  const contingencyMatrix: number[][] = Array.from({ length: trueSpeciesList.length }, () =>
    new Array(k).fill(0)
  );

  for (let i = 0; i < n; i++) {
    const sIdx = trueSpeciesList.indexOf(dataset[i].species);
    const c = clusters[i];
    if (sIdx !== -1 && c >= 0 && c < k) {
      contingencyMatrix[sIdx][c]++;
    }
  }

  // Majority vote mapping: for each cluster, assign the species with highest occurrence
  const clusterToSpeciesMap: Record<number, string> = {};
  for (let c = 0; c < k; c++) {
    let maxCount = -1;
    let bestSpecies = trueSpeciesList[0] || 'unknown';

    for (let s = 0; s < trueSpeciesList.length; s++) {
      if (contingencyMatrix[s][c] > maxCount) {
        maxCount = contingencyMatrix[s][c];
        bestSpecies = trueSpeciesList[s];
      }
    }
    clusterToSpeciesMap[c] = bestSpecies;
  }

  // Find misclassifications and compute accuracy
  const misclassifiedPoints: MisclassifiedPoint[] = [];
  let correctCount = 0;

  for (let i = 0; i < n; i++) {
    const item = dataset[i];
    const c = clusters[i];
    const assignedSpecies = clusterToSpeciesMap[c];

    if (assignedSpecies.toLowerCase() === item.species.toLowerCase()) {
      correctCount++;
    } else {
      misclassifiedPoints.push({
        id: item.id,
        sepalLength: item.sepalLength,
        sepalWidth: item.sepalWidth,
        petalLength: item.petalLength,
        petalWidth: item.petalWidth,
        trueSpecies: item.species,
        predictedCluster: c,
        assignedSpecies
      });
    }
  }

  const accuracy = n > 0 ? Number(((correctCount / n) * 100).toFixed(2)) : 0;
  const trueLabels = dataset.map((d) => d.species);
  const adjustedRandIndex = calculateAdjustedRandIndex(trueLabels, clusters);

  return {
    clusterToSpeciesMap,
    speciesList: trueSpeciesList,
    clustersList,
    confusionMatrix: contingencyMatrix,
    accuracy,
    adjustedRandIndex,
    silhouetteScore,
    misclassifiedPoints,
    totalPoints: n,
    misclassifiedCount: misclassifiedPoints.length
  };
}

/**
 * Runs Elbow Method from k = 1 to 10
 */
export function computeElbowMethod(
  data: number[][],
  seed: number,
  scalerParams: ScalerParams
): ElbowPoint[] {
  const results: ElbowPoint[] = [];

  for (let k = 1; k <= 10; k++) {
    const res = runKMeans(data, k, seed, 300, 1e-6, scalerParams);
    const sil = k >= 2 ? calculateSilhouetteScore(data, res.clusters, k) : 0;

    results.push({
      k,
      inertia: res.inertia,
      silhouette: sil
    });
  }

  return results;
}
