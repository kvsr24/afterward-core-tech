'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PatientIntake() {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('client_intakes')
        .insert([{ patient_name: name, raw_notes: notes }])
        .select();

      if (error) throw error;

      const newIntake = data?.[0];
      setMessage('Data packet localized. Initializing rule-based clinical biomarker tokenization...');

      const aiResponse = await fetch('/api/process-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeId: newIntake.id, rawNotes: notes }),
      });

      if (!aiResponse.ok) throw new Error('Therapeutic processing stream disruption.');

      setMessage('Record ingested. Extracted symptoms and automated protocol indexed.');
      setName('');
      setNotes('');
    } catch (err: any) {
      setMessage(`Telemetry Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 flex items-center justify-center p-8 font-serif" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
      <div className="w-full max-w-2xl bg-white border-2 border-stone-300 rounded-none p-10 shadow-sm relative">
        
        {/* Hospital Compliance Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-teal-800"></div>

        <div className="mb-8 border-b-2 border-stone-200 pb-6">
          <div className="flex justify-between items-center text-xs tracking-wider text-stone-500 uppercase font-bold mb-3">
            <span>Form Ref: ATC-INTAKE-2026</span>
            <span className="text-teal-800 bg-teal-50 px-2 py-0.5 border border-teal-200">HIPAA Protected</span>
          </div>
          <h1 className="text-3xl font-normal text-stone-900 tracking-tight">Afterward Core Tech</h1>
          <h2 className="text-xl font-normal text-stone-700 italic mt-1">Clinical Registry & Patient Triage Log</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-stone-50 p-4 border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block font-bold text-stone-600 uppercase mb-1">Facility Code</span>
              <span className="font-mono text-stone-800">HOSP-NY-09421</span>
            </div>
            <div>
              <span className="block font-bold text-stone-600 uppercase mb-1">Triage Protocol</span>
              <span className="font-mono text-stone-800">SYS-LEVEL-3-BIO</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Subject Identification (Legal Name)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="LAST NAME, FIRST NAME"
              className="w-full bg-white border border-stone-400 rounded-none px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">Clinical Presentation & Somatic History</label>
            <textarea
              required
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Exhaustively list therapeutic markers, metabolic indications, sleep fragmentation indices, or active pharmacological compounds currently taken..."
              className="w-full bg-white border border-stone-400 rounded-none px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors resize-none text-base leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-900 hover:bg-teal-950 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-3 px-4 rounded-none border border-teal-950 transition-colors text-sm uppercase tracking-widest shadow-sm"
          >
            {loading ? 'Transmitting Ingestion Stream...' : 'Authorize Secure Log Entry'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-none text-xs border ${message.startsWith('Telemetry Error') ? 'bg-red-50 border-red-300 text-red-900 font-mono' : 'bg-stone-50 border-stone-300 text-stone-800'}`}>
            <span className="font-bold block uppercase mb-1">System Notice:</span>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}