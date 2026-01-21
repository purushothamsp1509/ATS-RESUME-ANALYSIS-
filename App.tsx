
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ResultsDisplay from './components/ResultsDisplay';
import { extractTextFromPDF } from './services/pdfService';
import { analyzeResume } from './services/atsService';
import { ATSAnalysis, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setAppState(AppState.ANALYZING);
      setError(null);
      
      // Step 1: Extract Text
      const text = await extractTextFromPDF(file);
      
      if (!text.trim()) {
        throw new Error("Could not extract any text from the PDF. It might be a scanned image.");
      }

      // Step 2: Analyze Keywords
      const result = analyzeResume(text);
      
      // Simulated delay for better UX
      setTimeout(() => {
        setAnalysis(result);
        setAppState(AppState.RESULT);
      }, 800);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="px-6">
        {/* Intro Section */}
        {appState === AppState.IDLE && (
          <div className="max-w-3xl mx-auto text-center mb-12 animate-in fade-in duration-700">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              Is Your Resume Ready for <span className="text-indigo-600">Top Tech Roles?</span>
            </h2>
            <p className="text-lg text-gray-600">
              Upload your PDF resume to instantly check if it passes standard Applicant Tracking Systems (ATS) for full-stack developer positions.
            </p>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="max-w-5xl mx-auto">
          {appState === AppState.ERROR && (
            <div className="max-w-2xl mx-auto mb-8 bg-rose-50 border border-rose-200 p-6 rounded-2xl flex items-start">
              <div className="bg-rose-100 p-2 rounded-lg mr-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-rose-900 font-bold mb-1">Analysis Error</h3>
                <p className="text-rose-700 text-sm mb-4">{error}</p>
                <button 
                  onClick={handleReset}
                  className="text-rose-700 text-sm font-bold underline hover:text-rose-800"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {(appState === AppState.IDLE || appState === AppState.ANALYZING) && (
            <FileUploader 
              onFileSelect={handleFileSelect} 
              isProcessing={appState === AppState.ANALYZING} 
            />
          )}

          {appState === AppState.RESULT && analysis && (
            <ResultsDisplay analysis={analysis} onReset={handleReset} />
          )}

          {/* Tips Section */}
          {appState === AppState.IDLE && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">01</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Keyword Logic</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Most ATS systems look for exact keyword matches like "React" or "Python" in your skills and experience sections.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-indigo-600 font-bold">02</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Clean Layout</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Avoid tables, complex graphics, and multi-column layouts that can confuse automated text extraction tools.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-600 font-bold">03</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">80% Threshold</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Aim for a score of 80% or higher to ensure your resume stands out in high-volume recruitment pipelines.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto py-12 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} ATS Resume Master • Optimize for your future</p>
      </footer>
    </div>
  );
};

export default App;
