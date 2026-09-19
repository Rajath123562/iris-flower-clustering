/**
 * Principal Component Analysis (PCA) from scratch
 * Computes:
 * - Covariance matrix (4x4)
 * - Jacobi Eigenvalue Decomposition for real symmetric matrices
 * - Sorted eigenvectors & eigenvalues
 * - Explained variance ratio & cumulative variance
 * - 2D projection for data points, centroids, and arbitrary query points
 */

import { PCAResult, IrisRecord } from '../types';

/**
 * Computes the sample covariance matrix of a matrix X (n x d)
 * Assumes X is already mean-centered or mean-centers it internally
 */
export function computeCovarianceMatrix(data: number[][]): { cov: number[][]; means: number[] } {
  const n = data.length;
  const d = data[0].length;

  // Compute column means
  const means: number[] = new Array(d).fill(0);
  for (let j = 0; j < d; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += data[i][j];
    }
    means[j] = sum / n;
  }

  // Covariance matrix
  const cov: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  const denom = n > 1 ? n - 1 : 1;

  for (let j1 = 0; j1 < d; j1++) {
    for (let j2 = j1; j2 < d; j2++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += (data[i][j1] - means[j1]) * (data[i][j2] - means[j2]);
      }
      const val = sum / denom;
      cov[j1][j2] = val;
      cov[j2][j1] = val; // symmetric
    }
  }

  return { cov, means };
}

/**
 * Jacobi Eigenvalue Algorithm for real symmetric matrices
 * Diagonalizes matrix A such that V^T * A * V = D
 * Returns eigenvalues (diagonal of D) and eigenvectors (columns of V)
 */
export function jacobiEigenDecomposition(
  matrix: number[][],
  maxSweeps: number = 60,
  tolerance: number = 1e-12
): { eigenvalues: number[]; eigenvectors: number[][] } {
  const n = matrix.length;
  // Deep clone input matrix
  const A = matrix.map((row) => [...row]);

  // Initialize V as identity matrix (eigenvectors)
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    // Check sum of squared off-diagonal elements
    let offDiagSum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        offDiagSum += Math.abs(A[i][j]);
      }
    }

    if (offDiagSum < tolerance) {
      break;
    }

    // Zero out off-diagonal elements (p, q)
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const app = A[p][p];
        const aqq = A[q][q];
        const apq = A[p][q];

        if (Math.abs(apq) < 1e-15) continue;

        const tau = (aqq - app) / (2 * apq);
        let t: number;
        if (tau >= 0) {
          t = 1 / (tau + Math.sqrt(1 + tau * tau));
        } else {
          t = -1 / (-tau + Math.sqrt(1 + tau * tau));
        }

        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;
        const theta = s / (1 + c);

        // Update A[p][p] and A[q][q]
        A[p][p] = app - t * apq;
        A[q][q] = aqq + t * apq;
        A[p][q] = 0;
        A[q][p] = 0;

        // Update other elements in row/col p and q
        for (let j = 0; j < n; j++) {
          if (j !== p && j !== q) {
            const ajp = A[j][p];
            const ajq = A[j][q];
            A[j][p] = ajp - s * (ajq + theta * ajp);
            A[p][j] = A[j][p];
            A[j][q] = ajq + s * (ajp - theta * ajq);
            A[q][j] = A[j][q];
          }
        }

        // Accumulate eigenvectors in V
        for (let j = 0; j < n; j++) {
          const vjp = V[j][p];
          const vjq = V[j][q];
          V[j][p] = c * vjp - s * vjq;
          V[j][q] = s * vjp + c * vjq;
        }
      }
    }
  }

  // Extract eigenvalues
  const eigenvalues = A.map((row, i) => Math.max(0, row[i])); // eigenvalues of covariance matrix are >= 0

  // Sort eigenvalues and corresponding eigenvectors in descending order
  const indices = eigenvalues.map((_, i) => i);
  indices.sort((a, b) => eigenvalues[b] - eigenvalues[a]);

  const sortedEigenvalues = indices.map((idx) => eigenvalues[idx]);
  
  // Sorted eigenvectors matrix: each column j corresponds to sortedEigenvalues[j]
  const sortedEigenvectors: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      sortedEigenvectors[row][col] = V[row][indices[col]];
    }
  }

  return {
    eigenvalues: sortedEigenvalues,
    eigenvectors: sortedEigenvectors
  };
}

/**
 * Fits PCA on dataset and projects to 2D
 */
export function fitPCA(
  data: number[][],
  rawRecords: IrisRecord[],
  clusters: number[],
  workingCentroids: number[][]
): PCAResult {
  const n = data.length;
  const d = data[0].length;

  const { cov, means } = computeCovarianceMatrix(data);
  const { eigenvalues, eigenvectors } = jacobiEigenDecomposition(cov);

  const totalVariance = eigenvalues.reduce((acc, val) => acc + val, 0) || 1;
  const explainedVarianceRatio = eigenvalues.map((ev) => ev / totalVariance);
  
  let cum = 0;
  const cumulativeVariance = explainedVarianceRatio.map((ratio) => {
    cum += ratio;
    return cum;
  });

  // Project data points to PC1 and PC2
  // PC1 = sum_{j} (x_j - mean_j) * V[j][0]
  // PC2 = sum_{j} (x_j - mean_j) * V[j][1]
  const transformedData = data.map((point, i) => {
    let pc1 = 0;
    let pc2 = 0;
    for (let j = 0; j < d; j++) {
      const centered = point[j] - means[j];
      pc1 += centered * eigenvectors[j][0];
      pc2 += centered * eigenvectors[j][1];
    }

    const rec = rawRecords[i];
    return {
      id: rec ? rec.id : i + 1,
      pc1: Number(pc1.toFixed(3)),
      pc2: Number(pc2.toFixed(3)),
      cluster: clusters[i] ?? 0,
      species: rec ? rec.species : 'unknown',
      sepalLength: rec ? rec.sepalLength : point[0],
      sepalWidth: rec ? rec.sepalWidth : point[1],
      petalLength: rec ? rec.petalLength : point[2],
      petalWidth: rec ? rec.petalWidth : point[3]
    };
  });

  // Project centroids into PCA 2D space
  const projectedCentroids = workingCentroids.map((centroid, cIdx) => {
    let pc1 = 0;
    let pc2 = 0;
    for (let j = 0; j < d; j++) {
      const centered = centroid[j] - means[j];
      pc1 += centered * eigenvectors[j][0];
      pc2 += centered * eigenvectors[j][1];
    }
    return {
      cluster: cIdx,
      pc1: Number(pc1.toFixed(3)),
      pc2: Number(pc2.toFixed(3))
    };
  });

  // Standard deviations for reference
  const stds = cov.map((row, i) => Math.sqrt(row[i]) || 1);

  return {
    eigenvalues,
    eigenvectors,
    explainedVarianceRatio,
    cumulativeVariance,
    transformedData,
    projectedCentroids,
    means,
    stds
  };
}

/**
 * Projects an arbitrary point into the fitted 2D PCA space
 */
export function projectPointToPCA(
  point: number[],
  pcaMeans: number[],
  eigenvectors: number[][]
): { pc1: number; pc2: number } {
  const d = point.length;
  let pc1 = 0;
  let pc2 = 0;

  for (let j = 0; j < d; j++) {
    const centered = point[j] - pcaMeans[j];
    pc1 += centered * eigenvectors[j][0];
    pc2 += centered * eigenvectors[j][1];
  }

  return {
    pc1: Number(pc1.toFixed(3)),
    pc2: Number(pc2.toFixed(3))
  };
}
