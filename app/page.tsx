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
    if (!name || !notes) return alert('Please complete all identification protocols.');
    
    setLoading(true);
    setMessage('');

    const lowerNotes = notes.toLowerCase();
    const isHighRisk = lowerNotes.includes('severe') || lowerNotes.includes('pain') || lowerNotes.includes('critical') || lowerNotes.includes('high stress');
    
    const energyLevel = lowerNotes.includes('fatigue') || lowerNotes.includes('low energy') ? 'Severely Depleted' : 'Baseline';
    const sleepQuality = lowerNotes.includes('hours a night') || lowerNotes.includes('sleeping') ? 'Disrupted Sleep Architecture' : 'Optimal';
    
    const symptoms: string[] = [];
    if (lowerNotes.includes('fatigue')) symptoms.push('Fatigue Pattern');
    if (lowerNotes.includes('fog')) symptoms.push('Brain Fog');
    if (lowerNotes.includes('anxiety') || lowerNotes.includes('stress')) symptoms.push('Neurological Stress');

    const { error } = await supabase.from('client_intakes').insert([
      {
        patient_name: name,
        raw_notes: notes,
        suggested_protocol: "Pending medical director assessment.",
        status: "AI Processed",
        ai_risk_flag: isHighRisk,
        extracted_biomarkers: {
          energy_level: energyLevel,
          sleep_quality: sleepQuality,
          reported_symptoms: symptoms
        }
      }
    ]);

    setLoading(false);
    if (error) {
      setMessage(`Transmission Error: ${error.message}`);
    } else {
      setMessage('Secure Medical Intake Record Transmitted Successfully.');
      setName('');
      setNotes('');
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 p-8 font-serif flex items-center justify-center" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
      <div className="max-w-2xl w-full bg-white border-2 border-stone-300 p-8 shadow-sm">
        <div className="border-b-2 border-stone-300 pb-4 mb-6">
          <h1 className="text-3xl font-normal text-stone-950 tracking-tight">Subject Identification Intake</h1>
          <p className="text-xs text-stone-500 font-mono mt-1">Secured Transmission Node // Protocol Registry v1.0.4</p>
        </div>

        {message && (
          <div className={`p-3 border-2 mb-6 font-mono text-xs uppercase tracking-wide ${message.includes('Error') ? 'bg-red-50 text-red-900 border-red-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Subject Full Legal Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., TEST_PATIENT, JOHN"
              className="w-full bg-stone-50 border border-stone-400 p-3 text-sm focus:outline-none focus:border-stone-800 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Somatic Dossier (Unstructured Symptom Context)</label>
            <textarea 
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail metabolic changes, sleep indices, energy levels, or related physical symptoms..."
              className="w-full bg-stone-50 border border-stone-400 p-3 text-sm focus:outline-none focus:border-stone-800 font-sans leading-relaxed"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-stone-900 text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-stone-950 transition-colors border-2 border-stone-950"
          >
            {loading ? 'Transmitting Cryptographic Dossier...' : 'Authorize Secure Log Entry'}
          </button>
        </form>
      </div>
    </main>
  );
}