/**
 * Dataset Tab Component
 * Displays:
 * - Summary stats (mean, std, min, max, median per feature)
 * - Searchable data table with species badges
 * - CSV upload (drag & drop + click to select)
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  BarChart2,
  Filter
} from 'lucide-react';
import { IrisRecord, FeatureStats } from '../types';
import { parseIrisCsv } from '../data/irisData';
import { SPECIES_BG_CLASSES } from '../utils/colors';

interface DatasetTabProps {
  dataset: IrisRecord[];
  featureStats: FeatureStats[];
  onUploadCsv: (records: IrisRecord[]) => void;
  isCustomDataset: boolean;
  onResetToDefault: () => void;
}

export const DatasetTab: React.FC<DatasetTabProps> = ({
  dataset,
  featureStats,
  onUploadCsv,
  isCustomDataset,
  onResetToDefault
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

  const speciesOptions = useMemo(() => {
    const list = Array.from(new Set(dataset.map((d) => d.species.toLowerCase())));
    return ['all', ...list];
  }, [dataset]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return dataset.filter((row) => {
      const matchesSpecies = selectedSpecies === 'all' || row.species.toLowerCase() === selectedSpecies;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesSpecies;

      const matchesSearch =
        row.id.toString().includes(q) ||
        row.species.toLowerCase().includes(q) ||
        row.sepalLength.toString().includes(q) ||
        row.sepalWidth.toString().includes(q) ||
        row.petalLength.toString().includes(q) ||
        row.petalWidth.toString().includes(q);

      return matchesSpecies && matchesSearch;
    });
  }, [dataset, selectedSpecies, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  // Handle CSV file upload
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setUploadError('Failed to read file content.');
        return;
      }
      const result = parseIrisCsv(content);
      if (result.success && result.data) {
        onUploadCsv(result.data);
        setUploadSuccess(`Successfully loaded ${result.data.length} rows from ${file.name}`);
        setPage(1);
      } else {
        setUploadError(result.error || 'Failed to parse CSV file.');
      }
    };
    reader.onerror = () => {
      setUploadError('Error reading the selected file.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="dataset-tab-container" className="space-y-6">
      {/* Top Banner / Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-blue-600" />
            Iris Dataset Explorer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fisher's 1936 benchmark botanical dataset comprising 3 species and 4 morphological features.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-medium">
            Total Rows: <span className="font-bold">{dataset.length}</span>
          </div>
          {isCustomDataset && (
            <button
              id="reset-to-default-btn"
              onClick={onResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset to 150 Iris
            </button>
          )}
        </div>
      </div>

      {/* Feature Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureStats.map((stat) => (
          <div
            key={stat.feature}
            id={`stat-card-${stat.feature}`}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {stat.label}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                cm
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Mean</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {stat.mean.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Std Dev (σ)</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {stat.std.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Min</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {stat.min.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Max</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {stat.max.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Upload Section */}
      <div
        id="csv-drop-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Upload Custom CSV Dataset
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Columns required: sepal_length, sepal_width, petal_length, petal_width, species (optional).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="csv-file-input"
            className="cursor-pointer px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition-colors"
          >
            Select CSV File
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Upload Feedback */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}
      {uploadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="dataset-search-input"
            type="text"
            placeholder="Search by ID, species, or value..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Species Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {speciesOptions.map((sp) => {
            const isSelected = selectedSpecies === sp;
            return (
              <button
                key={sp}
                id={`filter-species-${sp}`}
                onClick={() => {
                  setSelectedSpecies(sp);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs capitalize whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table id="iris-data-table" className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-14"># ID</th>
                <th className="py-2.5 px-3">Sepal Length (cm)</th>
                <th className="py-2.5 px-3">Sepal Width (cm)</th>
                <th className="py-2.5 px-3">Petal Length (cm)</th>
                <th className="py-2.5 px-3">Petal Width (cm)</th>
                <th className="py-2.5 px-3">Species</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No samples matched your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const spClass =
                    SPECIES_BG_CLASSES[row.species.toLowerCase()] || SPECIES_BG_CLASSES.unknown;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2 px-3 font-mono text-slate-400">{row.id}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {row.sepalLength.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {row.sepalWidth.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {row.petalLength.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {row.petalWidth.toFixed(1)}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium capitalize ${spClass}`}
                        >
                          {row.species}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(page - 1) * rowsPerPage + 1} to{' '}
            {Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              id="prev-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Previous
            </button>
            <span className="px-2 font-mono">
              {page} / {totalPages}
            </span>
            <button
              id="next-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
