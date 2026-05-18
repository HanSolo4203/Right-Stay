'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';
import { parseReviewsMarkdown, generateSampleTemplate, type ParsedReview, type ValidationError } from '@/lib/parse-reviews-md';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  ArrowLeft,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export default function ImportReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedReviews, setParsedReviews] = useState<ParsedReview[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    duplicates: number;
    errors: number;
    message?: string;
  } | null>(null);
  const [lastImport, setLastImport] = useState<{ timestamp: string; count: number } | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/admin/login');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // Load last import info
  useEffect(() => {
    const loadLastImport = async () => {
      try {
        // You could store this in localStorage or fetch from an import_logs table
        const stored = localStorage.getItem('last_review_import');
        if (stored) {
          setLastImport(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading last import:', error);
      }
    };

    loadLastImport();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.md')) {
      alert('Please upload a .md file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    setFile(file);
    setImportResult(null);
    setValidationErrors([]);
    setParsedReviews([]);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      
      // Parse immediately
      const result = parseReviewsMarkdown(content);
      setParsedReviews(result.reviews);
      setValidationErrors(result.errors);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.md'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDownloadTemplate = () => {
    const template = generateSampleTemplate();
    const blob = new Blob([template], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviews-import-template.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (parsedReviews.length === 0) {
      alert('No valid reviews to import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/admin/reviews/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: fileContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Only throw error if there are NO valid reviews at all
        // If there are validation errors but some reviews were imported, treat as success
        if (data.validationErrors && data.validationErrors.length > 0 && data.imported === 0) {
          throw new Error(data.error || 'No valid reviews to import. Please fix validation errors and try again.');
        }
        throw new Error(data.error || 'Import failed');
      }

      // Success - even if there were validation errors, we imported valid ones
      const hasValidationWarnings = data.validationErrors && data.validationErrors.length > 0;
      const message = data.message || 
        (hasValidationWarnings 
          ? `Successfully imported ${data.imported} review(s). ${data.errors || 0} review(s) had validation errors and were skipped.`
          : `Successfully imported ${data.imported} review(s).`);

      setImportResult({
        success: true,
        imported: data.imported || 0,
        duplicates: data.duplicates || 0,
        errors: data.errors || 0,
        message: message,
      });

      // Store last import info
      const importInfo = {
        timestamp: new Date().toISOString(),
        count: data.imported || 0,
      };
      localStorage.setItem('last_review_import', JSON.stringify(importInfo));
      setLastImport(importInfo);

      // Clear file after successful import
      if (data.imported > 0) {
        setTimeout(() => {
          setFile(null);
          setFileContent('');
          setParsedReviews([]);
          setValidationErrors([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        imported: 0,
        duplicates: 0,
        errors: 0,
        message: error instanceof Error ? error.message : 'Failed to import reviews',
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-right-stay-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Import Reviews</h1>
          <p className="text-slate-500">Upload a markdown file to bulk import guest reviews</p>
          
          {lastImport && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500">
                Last import: {new Date(lastImport.timestamp).toLocaleString()} ({lastImport.count} reviews)
              </p>
            </div>
          )}
        </div>

        {/* Download Template Button */}
        <div className="mb-6">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-right-stay-50 hover:bg-right-stay-100 text-right-stay-700 rounded-lg border border-right-stay-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample Template</span>
          </button>
        </div>

        {/* File Upload Zone */}
        <div className="mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all bg-white ${
              isDragActive
                ? 'border-right-stay-500 bg-right-stay-50'
                : 'border-slate-300 hover:border-right-stay-400 hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            {file ? (
              <div>
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-700" />
                <p className="text-lg font-medium">{file.name}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a .md file here'}
                </p>
                <p className="text-sm text-slate-500">
                  or click to select a file (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {parsedReviews.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <FileCheck className="w-5 h-5" />
                  <span>Preview ({parsedReviews.length} reviews)</span>
                </h2>
                {validationErrors.length > 0 && (
                  <div className="flex items-center space-x-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{validationErrors.length} validation warning(s)</span>
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h3 className="font-semibold text-amber-700 mb-2">Validation Warnings:</h3>
                  <ul className="space-y-1 text-sm">
                    {validationErrors.map((error, idx) => (
                      <li key={idx} className="text-yellow-300">
                        Review {error.reviewIndex}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {parsedReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{review.guest_name}</h3>
                        <p className="text-sm text-slate-500">{review.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-700">⭐ {review.rating}/5</span>
                        {review.featured && (
                          <span className="px-2 py-1 bg-blue-500/20 text-right-stay-600 text-xs rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {review.testimonial}
                    </p>
                  </div>
                ))}
              </div>

              {/* Import Button */}
              <div className="mt-6 flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setFile(null);
                    setFileContent('');
                    setParsedReviews([]);
                    setValidationErrors([]);
                    setImportResult(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || parsedReviews.length === 0}
                  className="flex items-center space-x-2 px-6 py-2 bg-right-stay-500 hover:bg-right-stay-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Import {parsedReviews.length} Reviews</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div
            className={`p-6 rounded-lg border ${
              importResult.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              {importResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-700 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResult.success ? 'Import Successful!' : 'Import Failed'}
                </h3>
                {importResult.success ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                      ✅ Successfully imported: <strong className="text-green-700">{importResult.imported}</strong> review(s)
                    </p>
                    {importResult.duplicates > 0 && (
                      <p className="text-amber-700">
                        ⚠️ Duplicates skipped: <strong>{importResult.duplicates}</strong>
                      </p>
                    )}
                    {importResult.errors > 0 && (
                      <p className="text-amber-700">
                        ⚠️ Reviews with validation errors skipped: <strong>{importResult.errors}</strong>
                        <span className="text-yellow-300/70 ml-2 text-xs">
                          (These reviews had missing or invalid fields and were automatically skipped)
                        </span>
                      </p>
                    )}
                    {importResult.message && (
                      <p className="text-slate-500 text-xs mt-2 italic">{importResult.message}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-red-300 mb-2">{importResult.message}</p>
                    {validationErrors.length > 0 && (
                      <div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/20">
                        <p className="text-xs text-red-300 mb-1">Validation errors found:</p>
                        <ul className="text-xs text-red-300/80 space-y-1">
                          {validationErrors.slice(0, 5).map((error, idx) => (
                            <li key={idx}>• Review {error.reviewIndex}: {error.message}</li>
                          ))}
                          {validationErrors.length > 5 && (
                            <li className="text-red-300/60">... and {validationErrors.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
            <li>Download the sample template to see the expected format</li>
            <li>Create your markdown file following the template structure</li>
            <li>Upload the .md file using drag & drop or file selection</li>
            <li>Review the parsed reviews in the preview section</li>
            <li>Fix any validation errors if shown</li>
            <li>Click &quot;Import Reviews&quot; to bulk import</li>
            <li>Duplicates (same guest name + location) will be automatically skipped</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
