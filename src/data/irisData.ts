/**
 * Embedded 150-row Iris Dataset and CSV handling utilities
 * References: R.A. Fisher (1936), UCI Machine Learning Repository
 */

import { IrisRecord, FeatureStats, FeatureKey } from '../types';

export const RAW_IRIS_DATASET: IrisRecord[] = [
  // 50 Iris-setosa
  { id: 1, sepalLength: 5.1, sepalWidth: 3.5, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 2, sepalLength: 4.9, sepalWidth: 3.0, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 3, sepalLength: 4.7, sepalWidth: 3.2, petalLength: 1.3, petalWidth: 0.2, species: 'setosa' },
  { id: 4, sepalLength: 4.6, sepalWidth: 3.1, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 5, sepalLength: 5.0, sepalWidth: 3.6, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 6, sepalLength: 5.4, sepalWidth: 3.9, petalLength: 1.7, petalWidth: 0.4, species: 'setosa' },
  { id: 7, sepalLength: 4.6, sepalWidth: 3.4, petalLength: 1.4, petalWidth: 0.3, species: 'setosa' },
  { id: 8, sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 9, sepalLength: 4.4, sepalWidth: 2.9, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 10, sepalLength: 4.9, sepalWidth: 3.1, petalLength: 1.5, petalWidth: 0.1, species: 'setosa' },
  { id: 11, sepalLength: 5.4, sepalWidth: 3.7, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 12, sepalLength: 4.8, sepalWidth: 3.4, petalLength: 1.6, petalWidth: 0.2, species: 'setosa' },
  { id: 13, sepalLength: 4.8, sepalWidth: 3.0, petalLength: 1.4, petalWidth: 0.1, species: 'setosa' },
  { id: 14, sepalLength: 4.3, sepalWidth: 3.0, petalLength: 1.1, petalWidth: 0.1, species: 'setosa' },
  { id: 15, sepalLength: 5.8, sepalWidth: 4.0, petalLength: 1.2, petalWidth: 0.2, species: 'setosa' },
  { id: 16, sepalLength: 5.7, sepalWidth: 4.4, petalLength: 1.5, petalWidth: 0.4, species: 'setosa' },
  { id: 17, sepalLength: 5.4, sepalWidth: 3.9, petalLength: 1.3, petalWidth: 0.4, species: 'setosa' },
  { id: 18, sepalLength: 5.1, sepalWidth: 3.5, petalLength: 1.4, petalWidth: 0.3, species: 'setosa' },
  { id: 19, sepalLength: 5.7, sepalWidth: 3.8, petalLength: 1.7, petalWidth: 0.3, species: 'setosa' },
  { id: 20, sepalLength: 5.1, sepalWidth: 3.8, petalLength: 1.5, petalWidth: 0.3, species: 'setosa' },
  { id: 21, sepalLength: 5.4, sepalWidth: 3.4, petalLength: 1.7, petalWidth: 0.2, species: 'setosa' },
  { id: 22, sepalLength: 5.1, sepalWidth: 3.7, petalLength: 1.5, petalWidth: 0.4, species: 'setosa' },
  { id: 23, sepalLength: 4.6, sepalWidth: 3.6, petalLength: 1.0, petalWidth: 0.2, species: 'setosa' },
  { id: 24, sepalLength: 5.1, sepalWidth: 3.3, petalLength: 1.7, petalWidth: 0.5, species: 'setosa' },
  { id: 25, sepalLength: 4.8, sepalWidth: 3.4, petalLength: 1.9, petalWidth: 0.2, species: 'setosa' },
  { id: 26, sepalLength: 5.0, sepalWidth: 3.0, petalLength: 1.6, petalWidth: 0.2, species: 'setosa' },
  { id: 27, sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.6, petalWidth: 0.4, species: 'setosa' },
  { id: 28, sepalLength: 5.2, sepalWidth: 3.5, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 29, sepalLength: 5.2, sepalWidth: 3.4, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 30, sepalLength: 4.7, sepalWidth: 3.2, petalLength: 1.6, petalWidth: 0.2, species: 'setosa' },
  { id: 31, sepalLength: 4.8, sepalWidth: 3.1, petalLength: 1.6, petalWidth: 0.2, species: 'setosa' },
  { id: 32, sepalLength: 5.4, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.4, species: 'setosa' },
  { id: 33, sepalLength: 5.2, sepalWidth: 4.1, petalLength: 1.5, petalWidth: 0.1, species: 'setosa' },
  { id: 34, sepalLength: 5.5, sepalWidth: 4.2, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 35, sepalLength: 4.9, sepalWidth: 3.1, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 36, sepalLength: 5.0, sepalWidth: 3.2, petalLength: 1.2, petalWidth: 0.2, species: 'setosa' },
  { id: 37, sepalLength: 5.5, sepalWidth: 3.5, petalLength: 1.3, petalWidth: 0.2, species: 'setosa' },
  { id: 38, sepalLength: 4.9, sepalWidth: 3.6, petalLength: 1.4, petalWidth: 0.1, species: 'setosa' },
  { id: 39, sepalLength: 4.4, sepalWidth: 3.0, petalLength: 1.3, petalWidth: 0.2, species: 'setosa' },
  { id: 40, sepalLength: 5.1, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 41, sepalLength: 5.0, sepalWidth: 3.5, petalLength: 1.3, petalWidth: 0.3, species: 'setosa' },
  { id: 42, sepalLength: 4.5, sepalWidth: 2.3, petalLength: 1.3, petalWidth: 0.3, species: 'setosa' },
  { id: 43, sepalLength: 4.4, sepalWidth: 3.2, petalLength: 1.3, petalWidth: 0.2, species: 'setosa' },
  { id: 44, sepalLength: 5.0, sepalWidth: 3.5, petalLength: 1.6, petalWidth: 0.6, species: 'setosa' },
  { id: 45, sepalLength: 5.1, sepalWidth: 3.8, petalLength: 1.9, petalWidth: 0.4, species: 'setosa' },
  { id: 46, sepalLength: 4.8, sepalWidth: 3.0, petalLength: 1.4, petalWidth: 0.3, species: 'setosa' },
  { id: 47, sepalLength: 5.1, sepalWidth: 3.8, petalLength: 1.6, petalWidth: 0.2, species: 'setosa' },
  { id: 48, sepalLength: 4.6, sepalWidth: 3.2, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },
  { id: 49, sepalLength: 5.3, sepalWidth: 3.7, petalLength: 1.5, petalWidth: 0.2, species: 'setosa' },
  { id: 50, sepalLength: 5.0, sepalWidth: 3.3, petalLength: 1.4, petalWidth: 0.2, species: 'setosa' },

  // 50 Iris-versicolor
  { id: 51, sepalLength: 7.0, sepalWidth: 3.2, petalLength: 4.7, petalWidth: 1.4, species: 'versicolor' },
  { id: 52, sepalLength: 6.4, sepalWidth: 3.2, petalLength: 4.5, petalWidth: 1.5, species: 'versicolor' },
  { id: 53, sepalLength: 6.9, sepalWidth: 3.1, petalLength: 4.9, petalWidth: 1.5, species: 'versicolor' },
  { id: 54, sepalLength: 5.5, sepalWidth: 2.3, petalLength: 4.0, petalWidth: 1.3, species: 'versicolor' },
  { id: 55, sepalLength: 6.5, sepalWidth: 2.8, petalLength: 4.6, petalWidth: 1.5, species: 'versicolor' },
  { id: 56, sepalLength: 5.7, sepalWidth: 2.8, petalLength: 4.5, petalWidth: 1.3, species: 'versicolor' },
  { id: 57, sepalLength: 6.3, sepalWidth: 3.3, petalLength: 4.7, petalWidth: 1.6, species: 'versicolor' },
  { id: 58, sepalLength: 4.9, sepalWidth: 2.4, petalLength: 3.3, petalWidth: 1.0, species: 'versicolor' },
  { id: 59, sepalLength: 6.6, sepalWidth: 2.9, petalLength: 4.6, petalWidth: 1.3, species: 'versicolor' },
  { id: 60, sepalLength: 5.2, sepalWidth: 2.7, petalLength: 3.9, petalWidth: 1.4, species: 'versicolor' },
  { id: 61, sepalLength: 5.0, sepalWidth: 2.0, petalLength: 3.5, petalWidth: 1.0, species: 'versicolor' },
  { id: 62, sepalLength: 5.9, sepalWidth: 3.0, petalLength: 4.2, petalWidth: 1.5, species: 'versicolor' },
  { id: 63, sepalLength: 6.0, sepalWidth: 2.2, petalLength: 4.0, petalWidth: 1.0, species: 'versicolor' },
  { id: 64, sepalLength: 6.1, sepalWidth: 2.9, petalLength: 4.7, petalWidth: 1.4, species: 'versicolor' },
  { id: 65, sepalLength: 5.6, sepalWidth: 2.9, petalLength: 3.6, petalWidth: 1.3, species: 'versicolor' },
  { id: 66, sepalLength: 6.7, sepalWidth: 3.1, petalLength: 4.4, petalWidth: 1.4, species: 'versicolor' },
  { id: 67, sepalLength: 5.6, sepalWidth: 3.0, petalLength: 4.5, petalWidth: 1.5, species: 'versicolor' },
  { id: 68, sepalLength: 5.8, sepalWidth: 2.7, petalLength: 4.1, petalWidth: 1.0, species: 'versicolor' },
  { id: 69, sepalLength: 6.2, sepalWidth: 2.2, petalLength: 4.5, petalWidth: 1.5, species: 'versicolor' },
  { id: 70, sepalLength: 5.6, sepalWidth: 2.5, petalLength: 3.9, petalWidth: 1.1, species: 'versicolor' },
  { id: 71, sepalLength: 5.9, sepalWidth: 3.2, petalLength: 4.8, petalWidth: 1.8, species: 'versicolor' },
  { id: 72, sepalLength: 6.1, sepalWidth: 2.8, petalLength: 4.0, petalWidth: 1.3, species: 'versicolor' },
  { id: 73, sepalLength: 6.3, sepalWidth: 2.5, petalLength: 4.9, petalWidth: 1.5, species: 'versicolor' },
  { id: 74, sepalLength: 6.1, sepalWidth: 2.8, petalLength: 4.7, petalWidth: 1.2, species: 'versicolor' },
  { id: 75, sepalLength: 6.4, sepalWidth: 2.9, petalLength: 4.3, petalWidth: 1.3, species: 'versicolor' },
  { id: 76, sepalLength: 6.6, sepalWidth: 3.0, petalLength: 4.4, petalWidth: 1.4, species: 'versicolor' },
  { id: 77, sepalLength: 6.8, sepalWidth: 2.8, petalLength: 4.8, petalWidth: 1.4, species: 'versicolor' },
  { id: 78, sepalLength: 6.7, sepalWidth: 3.0, petalLength: 5.0, petalWidth: 1.7, species: 'versicolor' },
  { id: 79, sepalLength: 6.0, sepalWidth: 2.9, petalLength: 4.5, petalWidth: 1.5, species: 'versicolor' },
  { id: 80, sepalLength: 5.7, sepalWidth: 2.6, petalLength: 3.5, petalWidth: 1.0, species: 'versicolor' },
  { id: 81, sepalLength: 5.5, sepalWidth: 2.4, petalLength: 3.8, petalWidth: 1.1, species: 'versicolor' },
  { id: 82, sepalLength: 5.5, sepalWidth: 2.4, petalLength: 3.7, petalWidth: 1.0, species: 'versicolor' },
  { id: 83, sepalLength: 5.8, sepalWidth: 2.7, petalLength: 3.9, petalWidth: 1.2, species: 'versicolor' },
  { id: 84, sepalLength: 6.0, sepalWidth: 2.7, petalLength: 5.1, petalWidth: 1.6, species: 'versicolor' },
  { id: 85, sepalLength: 5.4, sepalWidth: 3.0, petalLength: 4.5, petalWidth: 1.5, species: 'versicolor' },
  { id: 86, sepalLength: 6.0, sepalWidth: 3.4, petalLength: 4.5, petalWidth: 1.6, species: 'versicolor' },
  { id: 87, sepalLength: 6.7, sepalWidth: 3.1, petalLength: 4.7, petalWidth: 1.5, species: 'versicolor' },
  { id: 88, sepalLength: 6.3, sepalWidth: 2.3, petalLength: 4.4, petalWidth: 1.3, species: 'versicolor' },
  { id: 89, sepalLength: 5.6, sepalWidth: 3.0, petalLength: 4.1, petalWidth: 1.3, species: 'versicolor' },
  { id: 90, sepalLength: 5.5, sepalWidth: 2.5, petalLength: 4.0, petalWidth: 1.3, species: 'versicolor' },
  { id: 91, sepalLength: 5.5, sepalWidth: 2.6, petalLength: 4.4, petalWidth: 1.2, species: 'versicolor' },
  { id: 92, sepalLength: 6.1, sepalWidth: 3.0, petalLength: 4.6, petalWidth: 1.4, species: 'versicolor' },
  { id: 93, sepalLength: 5.8, sepalWidth: 2.6, petalLength: 4.0, petalWidth: 1.2, species: 'versicolor' },
  { id: 94, sepalLength: 5.0, sepalWidth: 2.3, petalLength: 3.3, petalWidth: 1.0, species: 'versicolor' },
  { id: 95, sepalLength: 5.6, sepalWidth: 2.7, petalLength: 4.2, petalWidth: 1.3, species: 'versicolor' },
  { id: 96, sepalLength: 5.7, sepalWidth: 3.0, petalLength: 4.2, petalWidth: 1.2, species: 'versicolor' },
  { id: 97, sepalLength: 5.7, sepalWidth: 2.9, petalLength: 4.2, petalWidth: 1.3, species: 'versicolor' },
  { id: 98, sepalLength: 6.2, sepalWidth: 2.9, petalLength: 4.3, petalWidth: 1.3, species: 'versicolor' },
  { id: 99, sepalLength: 5.1, sepalWidth: 2.5, petalLength: 3.0, petalWidth: 1.1, species: 'versicolor' },
  { id: 100, sepalLength: 5.7, sepalWidth: 2.8, petalLength: 4.1, petalWidth: 1.3, species: 'versicolor' },

  // 50 Iris-virginica
  { id: 101, sepalLength: 6.3, sepalWidth: 3.3, petalLength: 6.0, petalWidth: 2.5, species: 'virginica' },
  { id: 102, sepalLength: 5.8, sepalWidth: 2.7, petalLength: 5.1, petalWidth: 1.9, species: 'virginica' },
  { id: 103, sepalLength: 7.1, sepalWidth: 3.0, petalLength: 5.9, petalWidth: 2.1, species: 'virginica' },
  { id: 104, sepalLength: 6.3, sepalWidth: 2.9, petalLength: 5.6, petalWidth: 1.8, species: 'virginica' },
  { id: 105, sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.8, petalWidth: 2.2, species: 'virginica' },
  { id: 106, sepalLength: 7.6, sepalWidth: 3.0, petalLength: 6.6, petalWidth: 2.1, species: 'virginica' },
  { id: 107, sepalLength: 4.9, sepalWidth: 2.5, petalLength: 4.5, petalWidth: 1.7, species: 'virginica' },
  { id: 108, sepalLength: 7.3, sepalWidth: 2.9, petalLength: 6.3, petalWidth: 1.8, species: 'virginica' },
  { id: 109, sepalLength: 6.7, sepalWidth: 2.5, petalLength: 5.8, petalWidth: 1.8, species: 'virginica' },
  { id: 110, sepalLength: 7.2, sepalWidth: 3.6, petalLength: 6.1, petalWidth: 2.5, species: 'virginica' },
  { id: 111, sepalLength: 6.5, sepalWidth: 3.2, petalLength: 5.1, petalWidth: 2.0, species: 'virginica' },
  { id: 112, sepalLength: 6.4, sepalWidth: 2.7, petalLength: 5.3, petalWidth: 1.9, species: 'virginica' },
  { id: 113, sepalLength: 6.8, sepalWidth: 3.0, petalLength: 5.5, petalWidth: 2.1, species: 'virginica' },
  { id: 114, sepalLength: 5.7, sepalWidth: 2.5, petalLength: 5.0, petalWidth: 2.0, species: 'virginica' },
  { id: 115, sepalLength: 5.8, sepalWidth: 2.8, petalLength: 5.1, petalWidth: 2.4, species: 'virginica' },
  { id: 116, sepalLength: 6.4, sepalWidth: 3.2, petalLength: 5.3, petalWidth: 2.3, species: 'virginica' },
  { id: 117, sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.5, petalWidth: 1.8, species: 'virginica' },
  { id: 118, sepalLength: 7.7, sepalWidth: 3.8, petalLength: 6.7, petalWidth: 2.2, species: 'virginica' },
  { id: 119, sepalLength: 7.7, sepalWidth: 2.6, petalLength: 6.9, petalWidth: 2.3, species: 'virginica' },
  { id: 120, sepalLength: 6.0, sepalWidth: 2.2, petalLength: 5.0, petalWidth: 1.5, species: 'virginica' },
  { id: 121, sepalLength: 6.9, sepalWidth: 3.2, petalLength: 5.7, petalWidth: 2.3, species: 'virginica' },
  { id: 122, sepalLength: 5.6, sepalWidth: 2.8, petalLength: 4.9, petalWidth: 2.0, species: 'virginica' },
  { id: 123, sepalLength: 7.7, sepalWidth: 2.8, petalLength: 6.7, petalWidth: 2.0, species: 'virginica' },
  { id: 124, sepalLength: 6.3, sepalWidth: 2.7, petalLength: 4.9, petalWidth: 1.8, species: 'virginica' },
  { id: 125, sepalLength: 6.7, sepalWidth: 3.3, petalLength: 5.7, petalWidth: 2.1, species: 'virginica' },
  { id: 126, sepalLength: 7.2, sepalWidth: 3.2, petalLength: 6.0, petalWidth: 1.8, species: 'virginica' },
  { id: 127, sepalLength: 6.2, sepalWidth: 2.8, petalLength: 4.8, petalWidth: 1.8, species: 'virginica' },
  { id: 128, sepalLength: 6.1, sepalWidth: 3.0, petalLength: 4.9, petalWidth: 1.8, species: 'virginica' },
  { id: 129, sepalLength: 6.4, sepalWidth: 2.8, petalLength: 5.6, petalWidth: 2.1, species: 'virginica' },
  { id: 130, sepalLength: 7.2, sepalWidth: 3.0, petalLength: 5.8, petalWidth: 1.6, species: 'virginica' },
  { id: 131, sepalLength: 7.4, sepalWidth: 2.8, petalLength: 6.1, petalWidth: 1.9, species: 'virginica' },
  { id: 132, sepalLength: 7.9, sepalWidth: 3.8, petalLength: 6.4, petalWidth: 2.0, species: 'virginica' },
  { id: 133, sepalLength: 6.4, sepalWidth: 2.8, petalLength: 5.6, petalWidth: 2.2, species: 'virginica' },
  { id: 134, sepalLength: 6.3, sepalWidth: 2.8, petalLength: 5.1, petalWidth: 1.5, species: 'virginica' },
  { id: 135, sepalLength: 6.1, sepalWidth: 2.6, petalLength: 5.6, petalWidth: 1.4, species: 'virginica' },
  { id: 136, sepalLength: 7.7, sepalWidth: 3.0, petalLength: 6.1, petalWidth: 2.3, species: 'virginica' },
  { id: 137, sepalLength: 6.3, sepalWidth: 3.4, petalLength: 5.6, petalWidth: 2.4, species: 'virginica' },
  { id: 138, sepalLength: 6.4, sepalWidth: 3.1, petalLength: 5.5, petalWidth: 1.8, species: 'virginica' },
  { id: 139, sepalLength: 6.0, sepalWidth: 3.0, petalLength: 4.8, petalWidth: 1.8, species: 'virginica' },
  { id: 140, sepalLength: 6.9, sepalWidth: 3.1, petalLength: 5.4, petalWidth: 2.1, species: 'virginica' },
  { id: 141, sepalLength: 6.7, sepalWidth: 3.1, petalLength: 5.6, petalWidth: 2.4, species: 'virginica' },
  { id: 142, sepalLength: 6.9, sepalWidth: 3.1, petalLength: 5.1, petalWidth: 2.3, species: 'virginica' },
  { id: 143, sepalLength: 5.8, sepalWidth: 2.7, petalLength: 5.1, petalWidth: 1.9, species: 'virginica' },
  { id: 144, sepalLength: 6.8, sepalWidth: 3.2, petalLength: 5.9, petalWidth: 2.3, species: 'virginica' },
  { id: 145, sepalLength: 6.7, sepalWidth: 3.3, petalLength: 5.7, petalWidth: 2.5, species: 'virginica' },
  { id: 146, sepalLength: 6.7, sepalWidth: 3.0, petalLength: 5.2, petalWidth: 2.3, species: 'virginica' },
  { id: 147, sepalLength: 6.3, sepalWidth: 2.5, petalLength: 5.0, petalWidth: 1.9, species: 'virginica' },
  { id: 148, sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.2, petalWidth: 2.0, species: 'virginica' },
  { id: 149, sepalLength: 6.2, sepalWidth: 3.4, petalLength: 5.4, petalWidth: 2.3, species: 'virginica' },
  { id: 150, sepalLength: 5.9, sepalWidth: 3.0, petalLength: 5.1, petalWidth: 1.8, species: 'virginica' }
];

export const FEATURE_NAMES: { key: FeatureKey; label: string; unit: string; description: string }[] = [
  { key: 'sepalLength', label: 'Sepal Length', unit: 'cm', description: 'Length of the outermost flower leaflet' },
  { key: 'sepalWidth', label: 'Sepal Width', unit: 'cm', description: 'Width of the outermost flower leaflet' },
  { key: 'petalLength', label: 'Petal Length', unit: 'cm', description: 'Length of the inner flower petal' },
  { key: 'petalWidth', label: 'Petal Width', unit: 'cm', description: 'Width of the inner flower petal' }
];

/**
 * Calculates descriptive statistics (mean, std, min, max, median) for each feature
 */
export function calculateFeatureStats(dataset: IrisRecord[]): FeatureStats[] {
  if (dataset.length === 0) return [];

  return FEATURE_NAMES.map(({ key, label }) => {
    const values = dataset.map((d) => d[key]).sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const std = Math.sqrt(variance);

    const min = values[0];
    const max = values[values.length - 1];
    const median = n % 2 === 0 ? (values[n / 2 - 1] + values[n / 2]) / 2 : values[Math.floor(n / 2)];

    return {
      feature: key,
      label,
      mean: Number(mean.toFixed(3)),
      std: Number(std.toFixed(3)),
      min: Number(min.toFixed(3)),
      max: Number(max.toFixed(3)),
      median: Number(median.toFixed(3))
    };
  });
}

/**
 * Extracts 4D numeric matrix from dataset: [sepalLength, sepalWidth, petalLength, petalWidth]
 */
export function extractFeatureMatrix(dataset: IrisRecord[]): number[][] {
  return dataset.map((d) => [d.sepalLength, d.sepalWidth, d.petalLength, d.petalWidth]);
}

/**
 * Parses a CSV string with flexible column matching (supports sepal_length, SepalLength, sepal.length, etc.)
 */
export function parseIrisCsv(csvText: string): { success: boolean; data?: IrisRecord[]; error?: string } {
  try {
    const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, error: 'CSV file must contain a header row and at least one data row.' };
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\s_.-]/g, ''));
    
    // Locate columns
    const slIdx = header.findIndex((h) => h.includes('sepallength') || h === 'sl' || h.includes('sepal_len'));
    const swIdx = header.findIndex((h) => h.includes('sepalwidth') || h === 'sw' || h.includes('sepal_wid'));
    const plIdx = header.findIndex((h) => h.includes('petallength') || h === 'pl' || h.includes('petal_len'));
    const pwIdx = header.findIndex((h) => h.includes('petalwidth') || h === 'pw' || h.includes('petal_wid'));
    const spIdx = header.findIndex((h) => h.includes('species') || h.includes('class') || h.includes('target') || h.includes('label'));

    if (slIdx === -1 || swIdx === -1 || plIdx === -1 || pwIdx === -1) {
      return {
        success: false,
        error: 'CSV must contain 4 numerical columns: sepal length, sepal width, petal length, petal width.'
      };
    }

    const parsedData: IrisRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 4) continue;

      const sl = parseFloat(parts[slIdx]);
      const sw = parseFloat(parts[swIdx]);
      const pl = parseFloat(parts[plIdx]);
      const pw = parseFloat(parts[pwIdx]);

      if (isNaN(sl) || isNaN(sw) || isNaN(pl) || isNaN(pw)) {
        continue;
      }

      let species = 'unknown';
      if (spIdx !== -1 && parts[spIdx]) {
        species = parts[spIdx].toLowerCase().replace(/^iris-/, '');
      }

      parsedData.push({
        id: parsedData.length + 1,
        sepalLength: sl,
        sepalWidth: sw,
        petalLength: pl,
        petalWidth: pw,
        species
      });
    }

    if (parsedData.length < 5) {
      return { success: false, error: 'At least 5 valid numeric rows are required for clustering analysis.' };
    }

    return { success: true, data: parsedData };
  } catch (err) {
    return { success: false, error: `CSV parsing error: ${err instanceof Error ? err.message : String(err)}` };
  }
}
