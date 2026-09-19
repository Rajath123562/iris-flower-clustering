# Iris Flower Clustering — Interactive ML Dashboard

An interactive, visual exploration of unsupervised machine learning on Ronald Fisher's classic 1936 Iris dataset. 

Instead of relying on black-box libraries like scikit-learn, the core algorithms in this project—including **K-Means with k-means++ initialization**, **StandardScaler z-score normalization**, and **Principal Component Analysis (PCA) via Jacobi eigen-decomposition**—are implemented from scratch in pure TypeScript to run entirely in your browser.

---

## Why this project?

The Iris dataset has 150 specimens, 4 physical measurements (sepal length, sepal width, petal length, petal width), and 3 botanical species (*Iris setosa*, *Iris versicolor*, and *Iris virginica*). 

It's often introduced in machine learning textbooks as a simple toy problem, but running unsupervised clustering on it reveals interesting real-world dynamics:
- **Setosa** is linearly separable and cleanly detaches into its own cluster without guidance.
- **Versicolor and Virginica** overlap along their dimensional boundaries, creating genuine ambiguity that reveals how distance metrics, random seeds, and feature scaling impact cluster assignment.

This project turns those mathematical concepts into an interactive, visual sandbox where you can tweak parameters, inspect iterations, and see the results instantly.

---

## What's Inside

- **Exploratory Data Table & Summary Stats**: Browse the full 150-row Fisher dataset with per-feature statistics (mean, standard deviation, min, max, median) or upload your own CSV.
- **Feature Scaling (StandardScaler)**: Toggle between raw centimeter measurements and z-score standardized values to observe how variance differences skew Euclidean distance.
- **K-Means from Scratch**:
  - **k-means++ initialization** for smart centroid seeding.
  - **Deterministic Mulberry32 PRNG** so experiments are 100% reproducible with seed numbers.
  - Convergence monitoring, iteration counting, and WCSS (inertia) tracking.
- **Elbow Method & Silhouette Optimization**: Evaluate $k = 1$ through $10$ with side-by-side inertia and silhouette score charts, plus plain-English guidance on selecting the optimal $k$.
- **PCA Dimensionality Reduction**:
  - Exact covariance calculation and Jacobi rotations to extract eigenvalues and orthogonal eigenvectors.
  - Scree plot demonstrating that the first two principal components capture over 95% of total dataset variance.
  - Side-by-side 2D scatter plots comparing unsupervised cluster boundaries against biological ground truth.
  - Pairwise feature scatter plot with X/Y dimension selectors.
- **Ground-Truth Evaluation & Confusion Matrix**: Automatic majority-voting label mapping, post-mapping accuracy, Adjusted Rand Index (ARI), confusion matrix heatmap, and misclassified point inspection.
- **Live Flower Inference & Model Persistence**:
  - Interactive sliders to test custom measurements with botanical presets (typical Setosa, Versicolor, Virginica).
  - Real-time PCA projection beacon showing where your custom flower lands in 2D space.
  - Export and import trained model parameters as JSON files.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm` or your preferred package manager (`pnpm`, `yarn`)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/iris-flower-clustering.git
   cd iris-flower-clustering
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port indicated in your terminal).

### Production Build

To compile a production bundle:
```bash
npm run build
```

You can preview the production build locally with:
```bash
npm run preview
```

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Algorithms Implemented

All algorithms live under `src/ml/` and have zero external ML dependencies:

- **StandardScaler** (`src/ml/scaler.ts`): Standardizes features by computing feature-wise mean ($\mu$) and sample standard deviation ($\sigma$), then computing $z = \frac{x - \mu}{\sigma}$.
- **K-Means** (`src/ml/kmeans.ts`): Implements Lloyd's algorithm with k-means++ seeding, squared Euclidean distance minimization, and centroid updates until convergence ($\Delta < 10^{-6}$).
- **Principal Component Analysis** (`src/ml/pca.ts`): Computes sample covariance, solves for eigenvectors using iterative Jacobi matrix diagonal rotations, orders principal axes by variance, and projects samples to 2D.
- **Clustering Metrics** (`src/ml/metrics.ts`): Computes intra-cluster inertia (WCSS), pairwise silhouette coefficients, Adjusted Rand Index (ARI), and contingency tables.

---

## License

MIT License. Free to use, modify, and learn from.
