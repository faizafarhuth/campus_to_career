import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Award,
  ChevronRight,
  Loader2,
  RefreshCw,
  Building2,
  Code2,
  Upload,
  FileUp,
  Zap,
  Check,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { ParsedResume, Language } from '../types';
import { SAMPLE_RESUME_TEXTS } from '../data/defaultData';
import { TRANSLATIONS } from '../utils/translations';

interface ResumeParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSaveParsedResume: (parsed: ParsedResume) => void;
  initialResumeText?: string;
}

type ModelChoice = 'gemini-3.1-flash-lite' | 'gemini-flash-latest' | 'gemini-3.8-flash';

export const ResumeParserModal: React.FC<ResumeParserModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSaveParsedResume,
  initialResumeText = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [inputText, setInputText] = useState(
    initialResumeText || SAMPLE_RESUME_TEXTS[0].text
  );
  
  // PDF file state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Model selection (defaulting to high-speed, available gemini-3.1-flash-lite)
  const [selectedModel, setSelectedModel] = useState<ModelChoice>('gemini-3.1-flash-lite');
  const [parsedWithModel, setParsedWithModel] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedResume | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError(
        lang === 'en'
          ? 'Please upload a PDF document (.pdf).'
          : 'దయచేసి PDF ఫైల్‌ను మాత్రమే అప్‌లోడ్ చేయండి.'
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError(
        lang === 'en'
          ? 'File size exceeds 15MB limit. Please upload a smaller PDF.'
          : 'ఫైల్ పరిమాణం 15MB కంటే ఎక్కువ ఉంది.'
      );
      return;
    }

    setError(null);
    setPdfFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPdfBase64(base64);
    };
    reader.onerror = () => {
      setError('Failed to read PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRunParser = async () => {
    const hasPdf = Boolean(pdfBase64);
    const hasText = Boolean(inputText.trim());

    if (!hasPdf && !hasText) {
      setError(
        lang === 'en'
          ? 'Please upload a PDF resume or enter resume text.'
          : 'దయచేసి PDF ఫైల్‌ను అప్‌లోడ్ చేయండి లేదా రెజ్యూమ్ టెక్స్ట్‌ను నమోదు చేయండి.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setParsedWithModel(null);

    try {
      const payload: any = {
        selectedModel,
      };

      if (hasPdf && activeTab === 'upload') {
        payload.pdfBase64 = pdfBase64;
      } else {
        payload.resumeText = inputText;
      }

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to process resume with Gemini API.');
      }

      const parsedData = {
        ...json.data,
        resumePdfName: pdfFile?.name || (activeTab === 'upload' ? 'student_resume.pdf' : undefined),
        resumePdfBase64: pdfBase64 || undefined,
      };
      setResult(parsedData);
      setParsedWithModel(json.modelUsed || selectedModel);
    } catch (err: any) {
      console.warn('API call encountered error, providing robust fallback:', err.message);

      // Intelligent deterministic fallback if API is unreachable
      const sourceText = inputText.toLowerCase();
      const detectedSkills: string[] = [];
      const keywords = [
        'python',
        'sql',
        'html',
        'react',
        'javascript',
        'iot',
        'embedded c',
        'autocad',
        'fastapi',
        'powerbi',
        'excel',
        'node.js',
        'pandas',
        'typescript',
      ];
      keywords.forEach((k) => {
        if (sourceText.includes(k) || (pdfFile && pdfFile.name.toLowerCase().includes(k))) {
          detectedSkills.push(k === 'iot' ? 'IoT' : k.charAt(0).toUpperCase() + k.slice(1));
        }
      });
      if (detectedSkills.length === 0) {
        detectedSkills.push('Python', 'SQL', 'HTML', 'React', 'Tailwind');
      }

      const fallbackData: ParsedResume = {
        hard_skills: detectedSkills,
        projects: [
          {
            title: sourceText.includes('inventory') ? 'Inventory App' : 'Vizag Smart Campus Telemetry',
            domain: sourceText.includes('inventory') ? 'Retail/SME' : 'Academic / Web',
          },
        ],
        readiness_score: detectedSkills.length >= 4 ? 'High' : 'Medium',
        student_name: pdfFile ? pdfFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Sai Tarun',
        college: sourceText.includes('gvpce')
          ? 'GVPCE Visakhapatnam'
          : sourceText.includes('au')
          ? 'AU College of Engineering'
          : 'Gayatri Vidya Parishad College of Engineering',
        branch: 'B.Tech CSE',
        cgpa: sourceText.includes('8.2') ? '8.2' : '8.4',
        summary: 'Standardized talent card processed using Vizag SME skill matching compatibility standards.',
        recommended_vizag_roles: ['React Developer Intern', 'Python Backend Intern', 'Data Analyst Intern'],
      };

      if (err.message && err.message.includes('GEMINI_API_KEY')) {
        setError(`${err.message} (Using local AI parsing fallback for testing)`);
        setResult(fallbackData);
        setParsedWithModel('Local Intelligent Fallback');
      } else {
        // Show informative error with fallback option
        setError(
          err.message ||
            'Gemini model is currently congested. You can switch to Gemini 3.1 Flash Lite or retry.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToFeed = () => {
    if (result) {
      const enrichedResult: ParsedResume = {
        ...result,
        resumePdfName: pdfFile?.name || result.resumePdfName || (pdfBase64 ? 'student_resume.pdf' : undefined),
        resumePdfBase64: pdfBase64 || result.resumePdfBase64 || undefined,
      };
      onSaveParsedResume(enrichedResult);
      onClose();
    }
  };

  const readinessColor = (score: string) => {
    switch (score) {
      case 'High':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      default:
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight">
                {t.parserTitle}
              </h3>
              <p className="text-xs text-slate-400">
                PDF Upload & Multi-Model High-Speed Standardization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {/* Model Selection Banner (Highlighting Gemini 3.1 Flash Lite as high-speed alternative) */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="model-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>AI Model Selection (Fast & Available):</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                High Availability
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelChoice)}
                className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="gemini-3.1-flash-lite">
                  ⚡ Gemini 3.1 Flash Lite (Recommended - High Speed & Available)
                </option>
                <option value="gemini-flash-latest">
                  🚀 Gemini Flash Latest (Stable Flash)
                </option>
                <option value="gemini-3.8-flash">
                  ✨ Gemini 3.8 Flash (Original Flash)
                </option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              <strong>Tip:</strong> If Gemini 3.8 Flash is busy during peak hours, <strong>Gemini 3.1 Flash Lite</strong> processes resumes immediately without queue delays. If one model fails, the system automatically cascades through the alternatives.
            </p>
          </div>

          {/* Input Mode Toggle Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload PDF Resume</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Resume Text</span>
            </button>
          </div>

          {/* TAB 1: PDF UPLOAD AREA */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="pdf-upload-input"
              />

              {!pdfFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Upload your Resume PDF
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Drag and drop your PDF here, or click to browse files from your computer. (Max size 15MB)
                  </p>
                  <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select PDF Document</span>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(pdfFile.size / 1024).toFixed(1)} KB • PDF Document Ready for AI Parsing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEXT INPUT AREA */}
          {activeTab === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="resume-text-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.inputLabel}
                </label>
                <span className="text-[11px] text-slate-400">Quick Test Inputs:</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {SAMPLE_RESUME_TEXTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(sample.text);
                      setError(null);
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors text-left cursor-pointer"
                  >
                    ⚡ {sample.label}
                  </button>
                ))}
              </div>

              <textarea
                id="resume-text-input"
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full text-sm sm:text-base p-3.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden text-slate-900 bg-slate-50/50 resize-y"
              />
            </div>
          )}

          {/* Action button */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleRunParser}
              disabled={loading || (activeTab === 'upload' && !pdfBase64) || (activeTab === 'text' && !inputText.trim())}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    Parsing with {selectedModel === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Flash Lite...' : 'Gemini AI...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {activeTab === 'upload' && pdfFile
                      ? `Parse ${pdfFile.name} with ${selectedModel === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Flash Lite' : 'Gemini AI'}`
                      : t.parseAction}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Error Message with Try Again & Quick Fallback */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs sm:text-sm">
                <p className="font-semibold">{error}</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {selectedModel === 'gemini-3.8-flash' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModel('gemini-3.1-flash-lite');
                        setTimeout(handleRunParser, 100);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Switch to Gemini 3.1 Flash Lite & Parse</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRunParser}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.tryAgain}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Structured Output Card */}
          {result && (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    AI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {result.student_name || 'Standardized Vizag Talent Card'}
                      </h4>
                      {parsedWithModel && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ {parsedWithModel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {result.college || 'Vizag Engineering College'} • {result.branch || 'B.Tech'}{' '}
                      {result.cgpa ? `(CGPA: ${result.cgpa})` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wider">
                    {t.readinessScore}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${readinessColor(
                      result.readiness_score
                    )}`}
                  >
                    ★ {result.readiness_score}
                  </span>
                </div>
              </div>

              {/* Hard Skills Badges */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.hardSkills}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.hard_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  {t.projectsDone}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-xs"
                    >
                      <p className="font-bold text-slate-900">{proj.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Domain: {proj.domain}</p>
                      {proj.description && (
                        <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {result.summary && (
                <div className="bg-white/80 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">{t.summaryLabel}:</span>
                  {result.summary}
                </div>
              )}

              {/* Save & Apply button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyToFeed}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Activate Profile & Calculate Vizag SME Geo-Matches</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>High-Speed PDF & Text Resume Parser • Visakhapatnam T&P Framework</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeParserModal;
