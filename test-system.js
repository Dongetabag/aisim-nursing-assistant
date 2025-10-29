// AISim Nursing Assistant - System Test Script
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testSystem() {
    console.log('🏥 AISim Nursing Assistant - System Test');
    console.log('=====================================\n');

    // Test 1: Environment Variables
    console.log('1. Testing Environment Variables...');
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.log('❌ GOOGLE_GEMINI_API_KEY not found');
        return;
    }
    console.log('✅ Environment variables loaded');

    // Test 2: Google Gemini API Connection
    console.log('\n2. Testing Google Gemini API Connection...');
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        const result = await model.generateContent('Test connection for AISim Nursing Assistant');
        console.log('✅ Google Gemini API connection successful');
    } catch (error) {
        console.log('❌ Google Gemini API connection failed:', error.message);
        return;
    }

    // Test 3: Test Nursing Chart Generation
    console.log('\n3. Testing Nursing Chart Generation...');
    try {
        const testInput = {
            patientInfo: {
                name: 'Test Patient',
                age: 65,
                gender: 'female',
                roomNumber: '101A',
                admissionDate: '2024-01-15',
                diagnosis: 'Hypertension'
            },
            vitalSigns: {
                temperature: '98.6°F',
                bloodPressure: '140/90',
                heartRate: '72 bpm',
                respiratoryRate: '16/min',
                oxygenSaturation: '98%',
                painLevel: 3
            },
            assessment: {
                chiefComplaint: 'Elevated blood pressure',
                symptoms: ['Headache', 'Dizziness'],
                physicalFindings: 'BP elevated, no acute distress',
                mentalStatus: 'Alert and oriented x3',
                mobility: 'Independent with ADLs',
                skinCondition: 'Intact, no lesions'
            },
            interventions: {
                medications: ['Lisinopril 10mg daily'],
                treatments: ['Blood pressure monitoring'],
                procedures: ['EKG completed'],
                education: ['Hypertension management education']
            },
            observations: 'Patient stable, responding well to medication',
            chartType: 'assessment'
        };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        
        const prompt = `
You are an expert nursing documentation specialist working with AISim Nursing Assistant. Generate a comprehensive, compliant nursing chart based on the following information:

PATIENT INFORMATION:
- Name: ${testInput.patientInfo.name}
- Age: ${testInput.patientInfo.age}
- Gender: ${testInput.patientInfo.gender}
- Room: ${testInput.patientInfo.roomNumber}
- Admission Date: ${testInput.patientInfo.admissionDate}
- Primary Diagnosis: ${testInput.patientInfo.diagnosis}

VITAL SIGNS:
- Temperature: ${testInput.vitalSigns.temperature}
- Blood Pressure: ${testInput.vitalSigns.bloodPressure}
- Heart Rate: ${testInput.vitalSigns.heartRate}
- Respiratory Rate: ${testInput.vitalSigns.respiratoryRate}
- Oxygen Saturation: ${testInput.vitalSigns.oxygenSaturation}
- Pain Level: ${testInput.vitalSigns.painLevel}/10

ASSESSMENT:
- Chief Complaint: ${testInput.assessment.chiefComplaint}
- Symptoms: ${testInput.assessment.symptoms.join(', ')}
- Physical Findings: ${testInput.assessment.physicalFindings}
- Mental Status: ${testInput.assessment.mentalStatus}
- Mobility: ${testInput.assessment.mobility}
- Skin Condition: ${testInput.assessment.skinCondition}

INTERVENTIONS:
- Medications: ${testInput.interventions.medications.join(', ')}
- Treatments: ${testInput.interventions.treatments.join(', ')}
- Procedures: ${testInput.interventions.procedures.join(', ')}
- Education: ${testInput.interventions.education.join(', ')}

ADDITIONAL OBSERVATIONS:
${testInput.observations}

Please generate a professional nursing chart that includes nursing assessment, nursing diagnosis, nursing interventions, evaluation, and documentation sections.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const chartData = response.text();
        
        console.log('✅ Nursing chart generation successful');
        console.log('📄 Sample chart preview:');
        console.log(chartData.substring(0, 300) + '...\n');
        
    } catch (error) {
        console.log('❌ Nursing chart generation failed:', error.message);
        return;
    }

    // Test 4: Server Dependencies
    console.log('4. Testing Server Dependencies...');
    try {
        const express = require('express');
        const cors = require('cors');
        const helmet = require('helmet');
        const Joi = require('joi');
        const { v4: uuidv4 } = require('uuid');
        console.log('✅ All server dependencies available');
    } catch (error) {
        console.log('❌ Missing server dependencies:', error.message);
        return;
    }

    console.log('\n🎉 All tests passed! AISim Nursing Assistant is ready to use.');
    console.log('\nTo start the application:');
    console.log('  npm start');
    console.log('  or');
    console.log('  ./start.sh');
    console.log('\nThen visit: http://localhost:3000');
}

// Run the test
testSystem().catch(console.error);
