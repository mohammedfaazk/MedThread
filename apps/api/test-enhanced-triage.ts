/**
 * Test script for Enhanced Medical Triage System
 * Demonstrates improvements over old keyword-based system
 */

import { enhancedTriageService } from './src/services/medical-triage/enhanced-triage.service';

const testCases = [
  {
    name: 'Critical: Myocardial Infarction',
    input: {
      text: "Severe crushing chest pain for 2 hours. Pain radiating down my left arm. Very hard to breathe. Sweating profusely. Feel dizzy and nauseous.",
      age: 55,
      existingConditions: "diabetes, hypertension"
    },
    expectedPriority: 'HIGH',
    expectedESI: 1
  },
  {
    name: 'Negation Test: No Chest Pain',
    input: {
      text: "I'm worried about heart disease but I have no chest pain, no shortness of breath. Just general anxiety about my health.",
      age: 35
    },
    expectedPriority: 'LOW',
    expectedESI: 5
  },
  {
    name: 'Synonym Test: Colloquial Language',
    input: {
      text: "Can't catch my breath. Feels like an elephant sitting on my chest. Room is spinning. Throwing up.",
      age: 60
    },
    expectedPriority: 'HIGH',
    expectedESI: 2
  },
  {
    name: 'Combination: Possible Meningitis',
    input: {
      text: "High fever 104F, severe headache, stiff neck, confused and disoriented.",
      age: 25
    },
    expectedPriority: 'HIGH',
    expectedESI: 1
  },
  {
    name: 'Context: Pediatric Fever',
    input: {
      text: "My baby has a fever of 103F. She's 8 months old. Seems lethargic.",
      age: 1
    },
    expectedPriority: 'HIGH',
    expectedESI: 2
  },
  {
    name: 'Low Priority: Common Cold',
    input: {
      text: "Runny nose, mild headache, sneezing. Had it for 2 days. No fever.",
      age: 30
    },
    expectedPriority: 'LOW',
    expectedESI: 5
  },
  {
    name: 'Medium: Persistent Cough',
    input: {
      text: "Cough that won't go away for 3 weeks. Some fatigue. No fever or chest pain.",
      age: 45
    },
    expectedPriority: 'MEDIUM',
    expectedESI: 3
  },
  {
    name: 'High: Diabetic Emergency',
    input: {
      text: "Blood sugar reading is 450. Feeling very dizzy, nauseous, vomiting. Confused.",
      age: 50,
      existingConditions: "Type 1 diabetes"
    },
    expectedPriority: 'HIGH',
    expectedESI: 2
  },
  {
    name: 'Combination: Possible Stroke',
    input: {
      text: "Sudden severe headache - worst of my life. Face feels droopy on one side. Arm weakness. Slurred speech.",
      age: 65
    },
    expectedPriority: 'HIGH',
    expectedESI: 1
  },
  {
    name: 'Medium: UTI',
    input: {
      text: "Burning when I pee. Lower abdominal pain. Mild fever. Going to bathroom frequently.",
      age: 28
    },
    expectedPriority: 'MEDIUM',
    expectedESI: 4
  }
];

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ENHANCED MEDICAL TRIAGE SYSTEM - TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Input: "${testCase.input.text.substring(0, 80)}..."`);
    if (testCase.input.age) console.log(`   Age: ${testCase.input.age}`);
    if (testCase.input.existingConditions) console.log(`   Conditions: ${testCase.input.existingConditions}`);
    
    try {
      const result = await enhancedTriageService.analyzeTriage(testCase.input);
      
      console.log(`\n   ✓ Priority: ${result.priorityLevel} (Expected: ${testCase.expectedPriority})`);
      console.log(`   ✓ ESI Level: ${result.esiLevel} (Expected: ${testCase.expectedESI})`);
      console.log(`   ✓ Urgency Score: ${result.urgencyScore}/100`);
      console.log(`   ✓ Confidence: ${Math.round(result.confidence * 100)}%`);
      
      if (result.detectedSymptoms.length > 0) {
        console.log(`   ✓ Detected Symptoms:`);
        result.detectedSymptoms.slice(0, 3).forEach(s => {
          console.log(`      - ${s.canonical} (weight: ${s.weight}, confidence: ${Math.round(s.confidence * 100)}%)`);
        });
      }
      
      if (result.dangerousCombinations.length > 0) {
        console.log(`   ⚠️  Dangerous Combinations:`);
        result.dangerousCombinations.forEach(c => {
          console.log(`      - ${c.condition} (urgency: ${c.urgency}/10)`);
        });
      }
      
      if (result.redFlags.length > 0) {
        console.log(`   🚩 Red Flags: ${result.redFlags.join(', ')}`);
      }
      
      console.log(`   📊 Score Breakdown:`);
      console.log(`      - Ontology: ${result.analysisBreakdown.ontologyScore}`);
      console.log(`      - Combinations: ${result.analysisBreakdown.combinationScore}`);
      console.log(`      - LLM: ${result.analysisBreakdown.llmScore}`);
      console.log(`      - Context: ${result.analysisBreakdown.contextScore}`);
      
      console.log(`   💡 Reasoning: ${result.clinicalReasoning}`);
      console.log(`   🎯 Action: ${result.recommendedAction}`);
      
      // Check if result matches expectations
      const priorityMatch = result.priorityLevel === testCase.expectedPriority;
      const esiMatch = result.esiLevel === testCase.expectedESI;
      
      if (priorityMatch && esiMatch) {
        console.log(`\n   ✅ PASSED`);
        passed++;
      } else {
        console.log(`\n   ❌ FAILED`);
        if (!priorityMatch) console.log(`      Expected priority: ${testCase.expectedPriority}, got: ${result.priorityLevel}`);
        if (!esiMatch) console.log(`      Expected ESI: ${testCase.expectedESI}, got: ${result.esiLevel}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`\n   ❌ ERROR: ${error}`);
      failed++;
    }
    
    console.log('\n' + '─'.repeat(70));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`  Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
