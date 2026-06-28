'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ClientIntake {
  id: number;
  patient_name: string;
  raw_notes: string;
  suggested_protocol: string;
  status: string;
  ai_risk_flag: boolean;
  created_at: string;
  extracted_biomarkers: {
    energy_level?: string;
    sleep_quality?: string;
    reported_symptoms?: string[];
  };
}

export default function AdminDashboard() {
  const [intakes, setIntakes] = useState<ClientIntake[]>([]);
  const [loading, setLoading] = useState(true);

  // Client-side filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState(false);

  // Email generation UI state
  const [activeEmailDraft, setActiveEmailDraft] = useState<{ [key: number]: string }>({});

  const fetchIntakes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_intakes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setIntakes(data);
    setLoading(false);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from('client_intakes')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) fetchIntakes();
  };

  const generateEmailDraft = (item: ClientIntake) => {
    const symptoms = item.extracted_biomarkers?.reported_symptoms?.join(', ') || 'general metabolic indicators';
    
    const draft = `SUBJECT: Clinical Evaluation & Initial Protocol Onboarding - ${item.patient_name.toUpperCase()}

Dear ${item.patient_name},

Our clinical board has finalized the initial telemetry review regarding your submitted health dossier.

Based on the somatic markers parsed (presenting with: ${symptoms}), we have formalized your core therapeutic strategy. Your file has been triaged, and our medical director has mapped out your baseline protocol:

"${item.suggested_protocol}"

NEXT STEPS:
1. Review the protocol guidelines attached to your profile.
2. If blood panels were authorized, proceed to your designated diagnostic facility.
3. Our nursing staff will schedule an intake consultation within 48 business hours.

In institutional health compliance,
Clinical Operations Registry
Afterward Core Tech Stack`;

    setActiveEmailDraft(prev => ({ ...prev, [item.id]: draft }));
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  // Compute dynamic clinical metrics (Option 1)
  const totalPatients = intakes.length;
  const criticalRiskCount = intakes.filter(i => i.ai_risk_flag).length;
  const pendingCount = intakes.filter(i => i.status === 'AI Processed' || i.status === 'Pending').length;
  const processedCount = intakes.filter(i => i.status === 'Approved' || i.status === 'Labs Ordered').length;

  // Filter application matching (Option 2)
  const filteredIntakes = intakes.filter(item => {
    const matchesSearch = item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.raw_notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesRisk = !riskFilter || item.ai_risk_flag;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 p-8 font-serif" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex justify-between items-end mb-8 border-b-2 border-stone-300 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-teal-900 bg-teal-50 px-2.5 py-1 rounded-none border border-teal-200 inline-block mb-3">
              Institutional Medical Board Review
            </div>
            <h1 className="text-4xl font-normal text-stone-950 tracking-tight">Physician Triage Dashboard</h1>
            <p className="text-xs text-stone-500 mt-1 font-mono">Secured Connection | Operator Node: LOCAL-HOST-3000</p>
          </div>
          <button onClick={fetchIntakes} className="bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-400 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-none transition-colors shadow-sm">
            Poll Telemetry Registries
          </button>
        </div>

        {/* --- OPTION 1: CLINICAL METRICS BOARD --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-stone-300 p-4 rounded-none shadow-sm">
            <span className="block text-stone-500 font-bold text-xs uppercase tracking-wider">Total Active Records</span>
            <span className="text-3xl font-normal text-stone-900">{totalPatients}</span>
          </div>
          <div className="bg-white border-2 border-red-300 p-4 rounded-none shadow-sm bg-red-50/20">
            <span className="block text-red-700 font-bold text-xs uppercase tracking-wider">Critical Risk Flagged</span>
            <span className="text-3xl font-normal text-red-900 font-mono font-bold">{criticalRiskCount}</span>
          </div>
          <div className="bg-white border-2 border-amber-300 p-4 rounded-none shadow-sm">
            <span className="block text-amber-700 font-bold text-xs uppercase tracking-wider">Awaiting Evaluation</span>
            <span className="text-3xl font-normal text-amber-900">{pendingCount}</span>
          </div>
          <div className="bg-white border-2 border-emerald-300 p-4 rounded-none shadow-sm">
            <span className="block text-emerald-700 font-bold text-xs uppercase tracking-wider">Validated Protocols</span>
            <span className="text-3xl font-normal text-emerald-900">{processedCount}</span>
          </div>
        </div>

        {/* --- OPTION 2: CONTROLS & TRIAgE FILTER REGISTRY --- */}
        <div className="bg-white border-2 border-stone-300 p-5 rounded-none mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3">
            <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1 tracking-wider">Search Subject Dossiers</label>
            <input 
              type="text" 
              placeholder="Filter by name or somatic notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-400 px-3 py-1.5 rounded-none focus:outline-none focus:border-stone-800 text-sm font-sans"
            />
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1 tracking-wider">Filter Registry State</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-stone-50 border border-stone-400 px-3 py-1.5 rounded-none focus:outline-none focus:border-stone-800 text-sm font-sans"
            >
              <option value="ALL">Show All Ingestion Phases</option>
              <option value="AI Processed">AI Processed</option>
              <option value="Labs Ordered">Labs Ordered</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="w-full md:w-1/4 flex items-center h-full pt-4 md:pt-0">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-stone-700 uppercase tracking-wide">
              <input 
                type="checkbox"
                checked={riskFilter}
                onChange={(e) => setRiskFilter(e.target.checked)}
                className="w-4 h-4 accent-red-700 cursor-pointer rounded-none"
              />
              Isolate Critical Vectors Only
            </label>
          </div>
        </div>

        {/* Main List Rendering */}
        {loading ? (
          <p className="text-stone-600 text-xs uppercase font-bold tracking-widest font-mono">Querying secure institutional databases...</p>
        ) : filteredIntakes.length === 0 ? (
          <p className="text-stone-500 text-sm border-2 border-dashed border-stone-300 bg-white rounded-none p-12 text-center italic">No pending clinical cases match current criteria.</p>
        ) : (
          <div className="grid gap-8">
            {filteredIntakes.map((item) => (
              <div key={item.id} className="bg-white border-2 border-stone-300 rounded-none p-6 shadow-sm flex flex-col gap-6 relative">
                
                {/* Individual Card Medical Banner */}
                <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-2xl text-stone-950 tracking-tight">{item.patient_name}</h3>
                      <span className={`text-[11px] px-2.5 py-0.5 border-2 font-mono font-bold tracking-wider uppercase ${
                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-900 border-emerald-400' :
                        item.status === 'Labs Ordered' ? 'bg-amber-50 text-amber-900 border-amber-400' :
                        item.status === 'AI Processed' ? 'bg-teal-50 text-teal-950 border-teal-500' :
                        'bg-stone-100 text-stone-700 border-stone-400'
                      }`}>
                        {item.status}
                      </span>
                      {item.ai_risk_flag && (
                        <span className="text-[11px] bg-red-50 text-red-900 border-2 border-red-600 px-2.5 py-0.5 font-bold uppercase tracking-wider font-mono">
                          CRITICAL AMBULATORY RISK
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-1 font-mono">
                      GUID: {item.id} | INGEST_DATETIME: {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* --- OPTION 3: EMAIL TRIGGER BUTTON --- */}
                    <button onClick={() => generateEmailDraft(item)} className="bg-stone-100 hover:bg-stone-200 text-stone-800 border-2 border-stone-400 text-xs font-bold py-1.5 px-3 rounded-none transition-colors shadow-sm uppercase tracking-wide">
                      Draft Dispatch Dispatch
                    </button>
                    <button onClick={() => updateStatus(item.id, 'Labs Ordered')} className="bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-500 text-xs font-bold py-1.5 px-4 rounded-none transition-colors shadow-sm uppercase tracking-wide">
                      Authorize Lab Panel
                    </button>
                    <button onClick={() => updateStatus(item.id, 'Approved')} className="bg-teal-900 hover:bg-teal-950 text-white font-bold py-1.5 px-4 border-2 border-teal-950 rounded-none text-xs transition-colors shadow-sm uppercase tracking-wider">
                      Validate Protocol Signature
                    </button>
                  </div>
                </div>

                {/* Main Text Dossiers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-stone-600 mb-2 tracking-wider">Somatic Dossier (Unstructured Input)</h4>
                    <p className="text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-none p-4 leading-relaxed italic">
                      "{item.raw_notes}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-stone-600 mb-2 tracking-wider">Formulated Pharmacological Strategy</h4>
                    <p className="text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-none p-4 leading-relaxed">
                      {item.suggested_protocol}
                    </p>
                  </div>
                </div>

                {/* --- OPTION 3 INJECTED: SECURE TEXT DRAFT ACCORDION --- */}
                {activeEmailDraft[item.id] && (
                  <div className="bg-stone-900 text-stone-100 p-5 rounded-none font-mono border-2 border-stone-950 shadow-inner">
                    <div className="flex justify-between items-center border-b border-stone-700 pb-2 mb-3 text-xs">
                      <span className="text-stone-400 font-bold uppercase tracking-wider">Outbound Encrypted Correspondence Channel</span>
                      <button onClick={() => {
                        navigator.clipboard.writeText(activeEmailDraft[item.id]);
                        alert('Clinical text draft copied to operating system clipboard.');
                      }} className="text-teal-400 hover:text-teal-300 font-bold uppercase tracking-widest text-[11px]">
                        Copy Block Text
                      </button>
                    </div>
                    <pre className="text-xs whitespace-pre-wrap leading-relaxed font-sans select-all bg-stone-950 p-4 border border-stone-800 text-stone-200">
                      {activeEmailDraft[item.id]}
                    </pre>
                  </div>
                )}

                {/* Structured Clinical Biomarkers Section */}
                {item.extracted_biomarkers && Object.keys(item.extracted_biomarkers).length > 0 && (
                  <div className="bg-stone-50 border border-stone-200 rounded-none p-5">
                    <h4 className="text-xs font-bold uppercase text-stone-600 mb-4 tracking-wider border-b border-stone-200 pb-2">Synthesized Diagnostic Metadata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <span className="text-stone-500 font-bold block uppercase text-xs tracking-wide mb-1">Energy Vector Classification</span>
                        <span className="text-stone-900 font-normal italic">{item.extracted_biomarkers.energy_level || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-bold block uppercase text-xs tracking-wide mb-1">Sleep Architecture Index</span>
                        <span className="text-stone-900 font-normal italic">{item.extracted_biomarkers.sleep_quality || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-bold block uppercase text-xs tracking-wide mb-1">Symptom Mapping Signatures</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.extracted_biomarkers.reported_symptoms?.map((symptom: string, idx: number) => (
                            <span key={idx} className="bg-white border border-stone-400 text-stone-800 text-xs font-mono font-bold px-2 py-0.5 rounded-none uppercase tracking-tight">
                              {symptom}
                            </span>
                          )) || <span className="text-stone-500">Unspecified</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}