const express = require('express');
const geminiService = require('../services/geminiService');
const { v4: uuidv4 } = require('uuid');
const { chartGenerationLimiter, validateChartInput, handleValidationErrors } = require('../middleware/security');
const { auditLog } = require('../middleware/logger');

const router = express.Router();

// Generate nursing chart with rate limiting and validation
router.post('/generate', chartGenerationLimiter, validateChartInput, handleValidationErrors, async (req, res) => {
  try {
    const { nurseInput } = req.body;

    if (!nurseInput) {
      return res.status(400).json({
        success: false,
        error: 'Nurse input is required'
      });
    }

    const result = await geminiService.generateNursingChart(nurseInput);

    // Add unique chart ID
    result.chartId = uuidv4();
    result.generatedAt = new Date().toISOString();

    // Audit log for HIPAA compliance
    auditLog('chart_generated', req.ip, {
      chartId: result.chartId,
      chartType: nurseInput.chartType,
      patientInitial: nurseInput.patientInfo?.name?.charAt(0) || 'N/A',
      ip: req.ip,
      timestamp: result.generatedAt,
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Chart generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate nursing chart'
    });
  }
});

// Test Gemini API connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await geminiService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get charting templates
router.get('/templates', (req, res) => {
  const templates = {
    admission: {
      name: 'Admission Assessment',
      description: 'Comprehensive admission assessment and initial care plan',
      requiredFields: ['patientInfo', 'assessment', 'vitalSigns'],
      optionalFields: ['interventions', 'observations']
    },
    shift: {
      name: 'Shift Assessment',
      description: 'Ongoing patient assessment and care documentation',
      requiredFields: ['patientInfo', 'assessment'],
      optionalFields: ['vitalSigns', 'interventions', 'observations']
    },
    incident: {
      name: 'Incident Report',
      description: 'Documentation of patient incidents or unusual events',
      requiredFields: ['patientInfo', 'assessment'],
      optionalFields: ['vitalSigns', 'interventions', 'observations']
    },
    discharge: {
      name: 'Discharge Planning',
      description: 'Patient discharge assessment and care instructions',
      requiredFields: ['patientInfo', 'assessment'],
      optionalFields: ['interventions', 'observations']
    },
    assessment: {
      name: 'General Assessment',
      description: 'General patient assessment and care documentation',
      requiredFields: ['patientInfo', 'assessment'],
      optionalFields: ['vitalSigns', 'interventions', 'observations']
    }
  };

  res.json({
    success: true,
    data: templates
  });
});

// Get charting guidelines
router.get('/guidelines', (req, res) => {
  const guidelines = {
    general: [
      'Use clear, concise, and objective language',
      'Document all observations, interventions, and patient responses',
      'Include timestamps for all entries',
      'Use standard medical terminology',
      'Avoid abbreviations that are not universally recognized'
    ],
    assessment: [
      'Document comprehensive physical assessment findings',
      'Include patient\'s chief complaint and history',
      'Note any changes in condition since last assessment',
      'Document patient\'s response to previous interventions',
      'Include family/caregiver input when relevant'
    ],
    interventions: [
      'Document all nursing interventions performed',
      'Include rationale for interventions',
      'Note patient\'s response to interventions',
      'Document any modifications to care plan',
      'Include patient education provided'
    ],
    compliance: [
      'Ensure documentation meets regulatory requirements',
      'Follow facility-specific documentation standards',
      'Maintain patient confidentiality',
      'Use proper charting format and structure',
      'Include all required elements for legal protection'
    ]
  };

  res.json({
    success: true,
    data: guidelines
  });
});

// Validate chart input
router.post('/validate', (req, res) => {
  try {
    const { nurseInput } = req.body;
    const validationResult = geminiService.validateNurseInput(nurseInput);
    
    if (validationResult.error) {
      res.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.details
      });
    } else {
      res.json({
        success: true,
        message: 'Input validation passed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
