# AISim Nursing Assistant

🏥 **AI-Powered Nursing Charting Solution**

Transform your nursing documentation with AISim Nursing Assistant - an intelligent charting system that uses Google Gemini AI to generate comprehensive, compliant nursing charts from simple nurse inputs.

## 🌟 Features

### 🤖 AI-Powered Chart Generation
- **Google Gemini Integration**: Leverages advanced AI to create detailed nursing charts
- **Multiple Chart Types**: Support for admission, shift, incident, discharge, and general assessments
- **Compliance-Focused**: Generates charts that meet regulatory standards (HIPAA, Joint Commission, CMS)

### 📋 Comprehensive Assessment Categories
- **Physical Assessment**: Vital signs, cardiovascular, respiratory, neurological, and more
- **Psychosocial Assessment**: Mental status, emotional state, coping mechanisms
- **Functional Assessment**: ADLs, mobility, fall risk, safety concerns

### 🎯 Smart Input System
- **Intuitive Forms**: Easy-to-use interface for nurse data entry
- **Real-time Validation**: Input validation ensures data quality
- **Template Support**: Pre-built templates for different charting scenarios

### 📊 Professional Output
- **Structured Charts**: Well-formatted, professional nursing documentation
- **Download & Print**: Export charts in multiple formats
- **Chart History**: Track and manage generated charts

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Google Gemini API key (included in setup)
- Modern web browser

### Installation

1. **Clone or Download the Project**
   ```bash
   cd "AiSIm Nursing Assisatnt"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env file if needed (API key is pre-configured)
   ```

4. **Start the Application**
   ```bash
   npm start
   ```

5. **Access the Application**
   Open your browser and navigate to: `http://localhost:3000`

## 📖 Usage Guide

### 1. Select Chart Type
Choose from five chart types:
- **Admission Assessment**: Comprehensive initial patient evaluation
- **Shift Assessment**: Ongoing patient monitoring and care
- **Incident Report**: Documentation of patient incidents
- **Discharge Planning**: Patient discharge preparation
- **General Assessment**: Standard patient assessment

### 2. Enter Patient Information
Fill in the required patient details:
- Basic demographics (name, age, gender)
- Room number and admission date
- Primary diagnosis

### 3. Document Assessment Data
Provide comprehensive assessment information:
- **Vital Signs**: Temperature, blood pressure, heart rate, etc.
- **Chief Complaint**: Patient's main concern
- **Physical Findings**: Examination results
- **Symptoms**: Current symptoms and concerns
- **Mental Status**: Cognitive and emotional state
- **Mobility**: Patient's movement capabilities
- **Skin Condition**: Skin assessment findings

### 4. Record Interventions
Document nursing care provided:
- **Medications**: Administered medications
- **Treatments**: Therapeutic interventions
- **Procedures**: Medical procedures performed
- **Education**: Patient and family teaching

### 5. Generate Chart
Click "Generate Nursing Chart" to create your professional documentation using AI.

### 6. Review and Export
- Review the generated chart
- Download as text file
- Print for physical records
- Create new charts as needed

## 🔧 API Endpoints

### Chart Generation
```http
POST /api/charting/generate
Content-Type: application/json

{
  "nurseInput": {
    "patientInfo": { ... },
    "vitalSigns": { ... },
    "assessment": { ... },
    "interventions": { ... },
    "observations": "...",
    "chartType": "assessment"
  }
}
```

### Test Connection
```http
GET /api/charting/test-connection
```

### Get Templates
```http
GET /api/charting/templates
```

### Get Guidelines
```http
GET /api/charting/guidelines
```

## 🏥 Nursing Standards Compliance

### Regulatory Compliance
- **HIPAA**: Patient privacy and data security
- **Joint Commission**: Quality and safety standards
- **CMS**: Medicare/Medicaid requirements

### Documentation Standards
- Clear, objective language
- Standard medical terminology
- Real-time documentation
- Proper charting format
- Legal protection requirements

### Quality Indicators
- Patient safety measures
- Fall risk assessments
- Infection control documentation
- Medication reconciliation
- Patient education records

## 🛠️ Technical Details

### Architecture
- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript with modern CSS
- **AI Integration**: Google Gemini Pro API
- **Validation**: Joi schema validation
- **Security**: Helmet.js for security headers

### File Structure
```
AISim Nursing Assistant/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── env.example              # Environment configuration
├── routes/
│   └── charting.js          # API routes
├── services/
│   └── geminiService.js     # Google Gemini integration
├── data/
│   └── nursingStandards.js  # Nursing standards and compliance
└── frontend/
    ├── index.html           # Main application page
    ├── styles.css           # Application styling
    └── app.js              # Frontend JavaScript
```

### Environment Variables
```env
PORT=3000
NODE_ENV=development
GOOGLE_GEMINI_API_KEY=your_api_key_here
APP_NAME=AISim Nursing Assistant
CORS_ORIGIN=http://localhost:3000
```

## 🔒 Security Features

- **Data Encryption**: Secure API communication
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers
- **Error Handling**: Secure error management

## 📊 Performance

- **Fast Response**: Optimized AI processing
- **Scalable**: Built for multiple concurrent users
- **Efficient**: Minimal resource usage
- **Reliable**: Robust error handling

## 🆘 Troubleshooting

### Common Issues

1. **Connection Test Fails**
   - Verify Google Gemini API key is correct
   - Check internet connection
   - Ensure API key has proper permissions

2. **Chart Generation Fails**
   - Verify all required fields are filled
   - Check input validation errors
   - Ensure API quota hasn't been exceeded

3. **Application Won't Start**
   - Verify Node.js version (16+)
   - Check if port 3000 is available
   - Ensure all dependencies are installed

### Support
For technical support or questions:
- Check the troubleshooting section above
- Review the console logs for error details
- Ensure all prerequisites are met

## 🔄 Updates and Maintenance

### Regular Updates
- Monitor Google Gemini API updates
- Update nursing standards as regulations change
- Enhance user interface based on feedback
- Improve AI prompts for better chart quality

### Backup and Recovery
- Regular backup of generated charts
- Environment variable backup
- Database backup (if implemented)

## 📈 Future Enhancements

- **Database Integration**: Store and manage chart history
- **User Authentication**: Secure user accounts
- **Multi-language Support**: International nursing standards
- **Mobile App**: Native mobile application
- **Integration**: EHR system integration
- **Analytics**: Chart quality and usage analytics

## 📄 License

© 2024 AISim. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

## 🤝 Contributing

This is a proprietary AISim solution. For feature requests or bug reports, please contact the development team.

---

**AISim Nursing Assistant** - Revolutionizing nursing documentation with AI-powered precision and compliance.
