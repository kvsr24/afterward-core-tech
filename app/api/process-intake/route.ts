// @ts-nocheck
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intakeId, rawNotes } = body;

    if (!intakeId || !rawNotes) {
      return NextResponse.json({ error: 'Missing data tokens' }, { status: 400 });
    }

    const notesLower = rawNotes.toLowerCase();

    // rule-based biomarker extraction
    let energyLevel = 'Normal or unspecified';
    if (notesLower.includes('fatigue') || notesLower.includes('low energy') || notesLower.includes('tired')) {
      energyLevel = 'Reported chronic fatigue / low energy dips';
    } else if (notesLower.includes('high energy') || notesLower.includes('energetic')) {
      energyLevel = 'High / optimized energy levels';
    }

    let sleepQuality = 'Unspecified';
    const sleepMatch = rawNotes.match(/(\d+)\s*(?:hours|hrs|hr)/i);
    if (sleepMatch) {
      sleepQuality = `Restricted sleep: ${sleepMatch[0]} reported`;
    } else if (notesLower.includes('insomnia') || notesLower.includes('poor sleep') || notesLower.includes('waking up')) {
      sleepQuality = 'Disrupted sleep patterns reported';
    }

    // dynamic tag generation for symptoms
    const symptomKeywords = ['diabetic', 'diabetes', 'obese', 'obesity', 'overweight', 'fog', 'anxious', 'anxiety', 'pain', 'headache', 'stress'];
    const reportedSymptoms: string[] = [];

    symptomKeywords.forEach(keyword => {
      if (notesLower.includes(keyword)) {
        reportedSymptoms.push(keyword);
      }
    });
    
    if (reportedSymptoms.length === 0) {
      reportedSymptoms.push('general optimization');
    }

    //. clinical risk flag condition
    const aiRiskFlag = notesLower.includes('diabetic') || 
                       notesLower.includes('diabetes') || 
                       notesLower.includes('obese') || 
                       notesLower.includes('chest pain');

    // generate automated protocol recommendations
    let suggestedProtocol = 'Standard baseline biomarker tracking protocol.';
    if (notesLower.includes('diabetic') || notesLower.includes('diabetes')) {
      suggestedProtocol = 'Priority metabolic assessment panel. Fasting blood glucose, HbA1c, and continuous glucose monitoring (CGM) evaluation recommended.';
    } else if (notesLower.includes('obese') || notesLower.includes('overweight')) {
      suggestedProtocol = 'Body composition optimization protocol. Lipid panel panel extraction, metabolic rate analysis, and caloric baseline tracking.';
    }

    // update the Supabase row with our locally generated data structure
    const { error: updateError } = await supabase
      .from('client_intakes')
      .update({
        extracted_biomarkers: {
          energy_level: energyLevel,
          sleep_quality: sleepQuality,
          reported_symptoms: reportedSymptoms
        },
        ai_risk_flag: aiRiskFlag,
        suggested_protocol: suggestedProtocol,
        status: 'AI Processed'
      })
      .eq('id', intakeId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Processing Failure:', error.message || error);
    return NextResponse.json({ error: error.message || 'Pipeline exception' }, { status: 500 });
  }
}