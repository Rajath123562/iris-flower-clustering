/**
 * Consistent color palette and formatting helpers for Iris Clustering Project
 */

export const SPECIES_COLORS: Record<string, string> = {
  setosa: '#2563eb', // Blue
  versicolor: '#059669', // Emerald
  virginica: '#7c3aed', // Purple
  unknown: '#64748b'
};

export const SPECIES_BG_CLASSES: Record<string, string> = {
  setosa: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  versicolor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  virginica: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  unknown: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
};

export const CLUSTER_COLORS: string[] = [
  '#ea580c', // Cluster 0: Vivid orange
  '#0284c7', // Cluster 1: Deep cyan/sky
  '#db2777', // Cluster 2: Magenta pink
  '#65a30d', // Cluster 3: Lime green
  '#9333ea', // Cluster 4: Violet
  '#d97706', // Cluster 5: Amber
  '#0d9488', // Cluster 6: Teal
  '#e11d48', // Cluster 7: Rose red
  '#4f46e5', // Cluster 8: Indigo
  '#475569'  // Cluster 9: Slate
];

export function getClusterColor(clusterIndex: number): string {
  return CLUSTER_COLORS[clusterIndex % CLUSTER_COLORS.length];
}

export function getSpeciesColor(species: string): string {
  const normalized = species.toLowerCase().replace(/^iris-/, '');
  return SPECIES_COLORS[normalized] || SPECIES_COLORS.unknown;
}

export function downloadJsonFile(filename: string, data: unknown) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
