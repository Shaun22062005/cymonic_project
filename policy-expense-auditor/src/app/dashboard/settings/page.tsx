'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ingestData, setIngestData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus('loading');
    const formData = new FormData();
    formData.append('policy', file);

    try {
      const res = await fetch('/api/policy/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setIngestData(data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Company Policy</h1>
        <p className="text-slate-500 mt-1">Ingest policy documents to update the RAG-based auditing engine.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center transition-all relative group",
            status === 'success' ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          )}>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf"
            />
            
            {status === 'success' ? (
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            ) : (
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-slate-600 transition-colors" />
            )}
            
            <p className="text-lg font-bold text-slate-900">
              {file ? file.name : "Click to upload policy PDF"}
            </p>
            <p className="text-sm text-slate-500 mt-1">Only PDF files are supported for ingestion.</p>
          </div>

          <button 
            type="submit"
            disabled={!file || status === 'loading'}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            {status === 'loading' ? 'Ingesting PDF...' : 'Update Policy Engine'}
          </button>
        </form>

        {status === 'success' && (
          <div className="p-4 bg-emerald-100/50 border border-emerald-200 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Success!</p>
              <p className="text-sm text-emerald-700">
                Policy ingested successfully. {ingestData?.chunkCount} knowledge chunks were added to the vector database.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm text-rose-700">Failed to ingest policy. Please check the file and try again.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-2">How it works</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our engine splits your policy into semantic chunks, generates vector embeddings, and stores them in Qdrant. During audits, relevant sections are retrieved to provide context-aware reasoning.
          </p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-2">Audit Accuracy</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Updating the policy will immediately affect all future audits. Already processed claims will not be re-audited unless manually triggered.
          </p>
        </div>
      </div>
    </div>
  );
}
