/**
 * StandardScaler (Z-score normalization) from scratch
 * Formula: z = (x - mean) / std
 */

import { ScalerParams } from '../types';

export class StandardScaler {
  /**
   * Computes means and standard deviations for each feature column
   */
  static fit(data: number[][]): { means: number[]; stds: number[] } {
    if (data.length === 0 || data[0].length === 0) {
      return { means: [], stds: [] };
    }

    const numFeatures = data[0].length;
    const n = data.length;
    const means: number[] = new Array(numFeatures).fill(0);
    const stds: number[] = new Array(numFeatures).fill(0);

    // Compute mean
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += data[i][j];
      }
      means[j] = sum / n;
    }

    // Compute sample standard deviation
    for (let j = 0; j < numFeatures; j++) {
      let sumSqDiff = 0;
      for (let i = 0; i < n; i++) {
        sumSqDiff += Math.pow(data[i][j] - means[j], 2);
      }
      const variance = sumSqDiff / (n > 1 ? n : 1);
      // Guard against division by zero for constant features
      stds[j] = Math.sqrt(variance) || 1.0;
    }

    return { means, stds };
  }

  /**
   * Transforms data matrix using fitted parameters if enabled is true
   */
  static transform(data: number[][], params: ScalerParams): number[][] {
    if (!params.enabled || params.means.length === 0) {
      // Return clone of original data
      return data.map((row) => [...row]);
    }

    const { means, stds } = params;
    return data.map((row) =>
      row.map((val, j) => {
        const std = stds[j] || 1;
        return (val - means[j]) / std;
      })
    );
  }

  /**
   * Transforms a single feature vector
   */
  static transformVector(vector: number[], params: ScalerParams): number[] {
    if (!params.enabled || params.means.length === 0) {
      return [...vector];
    }
    return vector.map((val, j) => (val - params.means[j]) / (params.stds[j] || 1));
  }

  /**
   * Inverts scaled data back to original feature scale
   */
  static inverseTransform(data: number[][], params: ScalerParams): number[][] {
    if (!params.enabled || params.means.length === 0) {
      return data.map((row) => [...row]);
    }

    const { means, stds } = params;
    return data.map((row) =>
      row.map((val, j) => {
        const std = stds[j] || 1;
        return val * std + means[j];
      })
    );
  }

  /**
   * Inverts a single feature vector
   */
  static inverseTransformVector(vector: number[], params: ScalerParams): number[] {
    if (!params.enabled || params.means.length === 0) {
      return [...vector];
    }
    return vector.map((val, j) => val * (params.stds[j] || 1) + params.means[j]);
  }
}
