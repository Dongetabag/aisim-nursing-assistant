const { GoogleGenerativeAI } = require('@google/generative-ai');
const Joi = require('joi');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
  }

  initialize() {
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Google Gemini API key not found in environment variables');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      this.isInitialized = true;
      
      console.log('✅ Google Gemini API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Gemini API:', error.message);
      this.isInitialized = false;
    }
  }

  async generateNursingChart(nurseInput) {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    // Validate input
    const validationResult = this.validateNurseInput(nurseInput);
    if (validationResult.error) {
      throw new Error(`Invalid input: ${validationResult.error.details[0].message}`);
    }

    try {
      const prompt = this.buildNursingChartPrompt(nurseInput);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const chartData = response.text();

      return {
        success: true,
        chartData: this.parseChartResponse(chartData),
        timestamp: new Date().toISOString(),
        inputSummary: this.createInputSummary(nurseInput)
      };
    } catch (error) {
      console.error('Error generating nursing chart:', error);
      throw new Error(`Failed to generate chart: ${error.message}`);
    }
  }

  validateNurseInput(input) {
    const schema = Joi.object({
      patientInfo: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(0).max(150).required(),
        gender: Joi.string().valid('male', 'female', 'other', 'prefer not to say').required(),
        roomNumber: Joi.string().optional(),
        admissionDate: Joi.string().optional(),
        diagnosis: Joi.string().optional()
      }).required(),
      vitalSigns: Joi.object({
        temperature: Joi.string().optional(),
        bloodPressure: Joi.string().optional(),
        heartRate: Joi.string().optional(),
        respiratoryRate: Joi.string().optional(),
        oxygenSaturation: Joi.string().optional(),
        painLevel: Joi.number().integer().min(0).max(10).optional()
      }).optional(),
      assessment: Joi.object({
        chiefComplaint: Joi.string().required(),
        symptoms: Joi.array().items(Joi.string()).optional(),
        physicalFindings: Joi.string().optional(),
        mentalStatus: Joi.string().optional(),
        mobility: Joi.string().optional(),
        skinCondition: Joi.string().optional()
      }).required(),
      interventions: Joi.object({
        medications: Joi.array().items(Joi.string()).optional(),
        treatments: Joi.array().items(Joi.string()).optional(),
        procedures: Joi.array().items(Joi.string()).optional(),
        education: Joi.array().items(Joi.string()).optional()
      }).optional(),
      observations: Joi.string().optional(),
      chartType: Joi.string().valid('admission', 'shift', 'incident', 'discharge', 'assessment').default('assessment')
    });

    return schema.validate(input);
  }

  buildNursingChartPrompt(input) {
    const { patientInfo, vitalSigns, assessment, interventions, observations, chartType } = input;

    return `
You are an expert nursing documentation specialist working with AISim Nursing Assistant. Generate a comprehensive, compliant nursing chart based on the following information:

PATIENT INFORMATION:
- Name: ${patientInfo.name}
- Age: ${patientInfo.age}
- Gender: ${patientInfo.gender}
- Room: ${patientInfo.roomNumber || 'Not specified'}
- Admission Date: ${patientInfo.admissionDate || 'Not specified'}
- Primary Diagnosis: ${patientInfo.diagnosis || 'Not specified'}

VITAL SIGNS:
${vitalSigns ? Object.entries(vitalSigns).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Not provided'}

ASSESSMENT:
- Chief Complaint: ${assessment.chiefComplaint}
- Symptoms: ${assessment.symptoms ? assessment.symptoms.join(', ') : 'Not specified'}
- Physical Findings: ${assessment.physicalFindings || 'Not specified'}
- Mental Status: ${assessment.mentalStatus || 'Not specified'}
- Mobility: ${assessment.mobility || 'Not specified'}
- Skin Condition: ${assessment.skinCondition || 'Not specified'}

INTERVENTIONS:
${interventions ? Object.entries(interventions).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n') : 'Not specified'}

ADDITIONAL OBSERVATIONS:
${observations || 'None provided'}

CHART TYPE: ${chartType.toUpperCase()}

Please generate a professional nursing chart that includes:

1. **NURSING ASSESSMENT** - Comprehensive patient assessment following nursing standards
2. **NURSING DIAGNOSIS** - Evidence-based nursing diagnoses
3. **NURSING INTERVENTIONS** - Specific, measurable interventions
4. **EVALUATION** - Expected outcomes and evaluation criteria
5. **DOCUMENTATION** - Proper nursing documentation format
6. **COMPLIANCE NOTES** - Any regulatory compliance considerations

Format the response as a structured JSON object with the following structure:
{
  "nursingAssessment": "...",
  "nursingDiagnosis": [...],
  "nursingInterventions": [...],
  "evaluation": "...",
  "documentation": "...",
  "complianceNotes": "...",
  "chartSummary": "..."
}

Ensure the chart follows current nursing documentation standards and is suitable for legal and regulatory compliance.
`;
  }

  parseChartResponse(responseText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, create a structured response
      return {
        nursingAssessment: this.extractSection(responseText, 'NURSING ASSESSMENT', 'NURSING DIAGNOSIS'),
        nursingDiagnosis: this.extractList(responseText, 'NURSING DIAGNOSIS', 'NURSING INTERVENTIONS'),
        nursingInterventions: this.extractList(responseText, 'NURSING INTERVENTIONS', 'EVALUATION'),
        evaluation: this.extractSection(responseText, 'EVALUATION', 'DOCUMENTATION'),
        documentation: this.extractSection(responseText, 'DOCUMENTATION', 'COMPLIANCE'),
        complianceNotes: this.extractSection(responseText, 'COMPLIANCE', ''),
        chartSummary: responseText.substring(0, 500) + '...'
      };
    } catch (error) {
      console.error('Error parsing chart response:', error);
      return {
        nursingAssessment: responseText,
        nursingDiagnosis: ['Unable to parse structured diagnosis'],
        nursingInterventions: ['Unable to parse structured interventions'],
        evaluation: 'Unable to parse evaluation',
        documentation: 'Unable to parse documentation',
        complianceNotes: 'Unable to parse compliance notes',
        chartSummary: responseText.substring(0, 500) + '...'
      };
    }
  }

  extractSection(text, startMarker, endMarker) {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return 'Not found';
    
    const endIndex = endMarker ? text.indexOf(endMarker, startIndex) : text.length;
    return text.substring(startIndex + startMarker.length, endIndex).trim();
  }

  extractList(text, startMarker, endMarker) {
    const section = this.extractSection(text, startMarker, endMarker);
    return section.split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.match(/^[-=]+$/))
      .map(item => item.replace(/^[-*]\s*/, ''));
  }

  createInputSummary(input) {
    return {
      patientName: input.patientInfo.name,
      chartType: input.chartType,
      chiefComplaint: input.assessment.chiefComplaint,
      timestamp: new Date().toISOString()
    };
  }

  async testConnection() {
    if (!this.isInitialized) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const result = await this.model.generateContent('Test connection');
      return { success: true, message: 'Gemini API connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GeminiService();
