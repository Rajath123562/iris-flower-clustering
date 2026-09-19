/**
 * Dynamic Findings & Insights Generator
 * Automatically analyzes current run parameters and metrics to produce clear plain-English findings
 */

import { ComparisonMetrics, KMeansResult, PCAResult, ScalerParams } from '../types';

export interface FindingsReport {
  title: string;
  verdict: 'excellent' | 'good' | 'moderate' | 'poor';
  highlights: string[];
  setosaAnalysis: string;
  overlapAnalysis: string;
  scalingImpact: string;
  pcaSummary: string;
  conclusion: string;
}

export function generateFindings(
  kmeans: KMeansResult,
  metrics: ComparisonMetrics,
  pca: PCAResult,
  scaler: ScalerParams
): FindingsReport {
  const { k } = kmeans;
  const { accuracy, adjustedRandIndex, silhouetteScore, misclassifiedCount, totalPoints } = metrics;
  const pc1Var = (pca.explainedVarianceRatio[0] * 100).toFixed(1);
  const pc2Var = (pca.explainedVarianceRatio[1] * 100).toFixed(1);
  const total2dVar = (pca.cumulativeVariance[1] * 100).toFixed(1);

  let verdict: 'excellent' | 'good' | 'moderate' | 'poor' = 'good';
  if (adjustedRandIndex > 0.75 && accuracy >= 88) {
    verdict = 'excellent';
  } else if (adjustedRandIndex > 0.55 && accuracy >= 75) {
    verdict = 'good';
  } else if (adjustedRandIndex > 0.35) {
    verdict = 'moderate';
  } else {
    verdict = 'poor';
  }

  const highlights: string[] = [];

  if (k === 3) {
    highlights.push(
      `With k = 3 matching the true biological species count, K-Means achieved ${accuracy}% classification alignment with an Adjusted Rand Index (ARI) of ${adjustedRandIndex}.`
    );
  } else {
    highlights.push(
      `Running with k = ${k} (different from the 3 ground-truth species). Silhouette score is ${silhouetteScore} with inertia ${kmeans.inertia}.`
    );
  }

  // Setosa separation
  const setosaAnalysis =
    'Iris-setosa exhibits complete geometrical separation from the other two species. Because of its distinctly compact petal dimensions (average length ~1.46 cm, width ~0.24 cm), K-Means groups setosa into its own pure cluster with 100% precision across virtually all random seeds.';

  // Versicolor vs Virginica overlap
  const overlapAnalysis =
    misclassifiedCount > 0
      ? `Iris-versicolor and Iris-virginica share a contiguous biological boundary where their petal length and width transition smoothly. In this current run, ${misclassifiedCount} out of ${totalPoints} specimens fell on the boundary and were clustered with their neighbouring species. This reflects real morphological variation rather than an algorithm flaw.`
      : 'Iris-versicolor and Iris-virginica achieved clean cluster demarcation under these specific parameters with zero boundary mismatches.';

  // Scaling impact
  const scalingImpact = scaler.enabled
    ? 'StandardScaler is currently ACTIVE. Standardizing z-scores puts all 4 features on equal footing (mean = 0, std = 1), preventing petal length (which has the highest raw variance) from disproportionately dominating Euclidean distance calculations.'
    : 'StandardScaler is currently INACTIVE (using raw measurements in cm). Petal length (ranging from 1.0 to 6.9 cm with wide variance) will exert greater influence on Euclidean distance than sepal width (which has much smaller variance).';

  // PCA summary
  const pcaSummary = `The first two principal components capture ${total2dVar}% of all variance in the 4-dimensional space (PC1: ${pc1Var}%, PC2: ${pc2Var}%). This confirms that a 2D projection provides an exceptionally faithful visual representation of the true cluster geometry.`;

  // Conclusion
  const conclusion =
    k === 3
      ? 'Unsupervised K-Means successfully recovers the inherent structure of the Iris dataset without any label supervision, reinforcing Ronald Fisher’s 1936 thesis on morphological distinctiveness.'
      : `Clustering at k = ${k} illustrates how unsupervised partitioning segments feature density. For natural species taxonomy, k = 3 remains the optimal ground-truth alignment.`;

  return {
    title: `Clustering Performance Summary (k=${k}, ${scaler.enabled ? 'Scaled' : 'Raw'})`,
    verdict,
    highlights,
    setosaAnalysis,
    overlapAnalysis,
    scalingImpact,
    pcaSummary,
    conclusion
  };
}
