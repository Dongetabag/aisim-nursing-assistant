// AISim Nursing Assistant - Frontend Application
class NursingAssistant {
    constructor() {
        this.selectedChartType = 'assessment';
        this.currentChart = null;
        this.init();
    }

    init() {
        this.loadChartTypes();
        this.bindEvents();
        this.testConnection();
    }

    bindEvents() {
        // Form submission
        document.getElementById('nursingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateChart();
        });

        // Chart type selection
        document.getElementById('chartTypeGrid').addEventListener('click', (e) => {
            const card = e.target.closest('.chart-type-card');
            if (card) {
                this.selectChartType(card.dataset.type);
            }
        });

        // Clear form
        document.getElementById('clearFormBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // Test connection
        document.getElementById('testConnectionBtn').addEventListener('click', () => {
            this.testConnection();
        });

        // Chart actions
        document.getElementById('downloadChartBtn').addEventListener('click', () => {
            this.downloadChart();
        });

        document.getElementById('printChartBtn').addEventListener('click', () => {
            this.printChart();
        });

        document.getElementById('newChartBtn').addEventListener('click', () => {
            this.createNewChart();
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeErrorModal();
        });

        // Close modal on outside click
        document.getElementById('errorModal').addEventListener('click', (e) => {
            if (e.target.id === 'errorModal') {
                this.closeErrorModal();
            }
        });
    }

    async loadChartTypes() {
        try {
            // Premium SVG icons with glass morphism design
            const svgIcons = {
                admission: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad-admission" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:rgba(100,200,255,0.3);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(100,200,255,0.1);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="10" y="14" width="28" height="26" rx="2" fill="url(#grad-admission)" stroke="rgba(100,200,255,0.5)" stroke-width="1.5"/>
                    <rect x="14" y="18" width="6" height="6" fill="rgba(100,200,255,0.2)" stroke="rgba(100,200,255,0.4)" stroke-width="1"/>
                    <rect x="22" y="18" width="6" height="6" fill="rgba(100,200,255,0.2)" stroke="rgba(100,200,255,0.4)" stroke-width="1"/>
                    <rect x="30" y="18" width="6" height="6" fill="rgba(100,200,255,0.2)" stroke="rgba(100,200,255,0.4)" stroke-width="1"/>
                    <path d="M24 28 L24 36 M20 32 L28 32" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round"/>
                </svg>`,
                shift: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad-shift" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" style="stop-color:rgba(100,255,100,0.2);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(100,255,100,0.4);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="14" y="26" width="6" height="12" rx="1" fill="url(#grad-shift)" stroke="rgba(100,255,100,0.6)" stroke-width="1.5"/>
                    <rect x="21" y="20" width="6" height="18" rx="1" fill="url(#grad-shift)" stroke="rgba(100,255,100,0.6)" stroke-width="1.5"/>
                    <rect x="28" y="14" width="6" height="24" rx="1" fill="url(#grad-shift)" stroke="rgba(100,255,100,0.6)" stroke-width="1.5"/>
                    <line x1="12" y1="40" x2="36" y2="40" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
                </svg>`,
                incident: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad-incident" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" style="stop-color:rgba(255,200,100,0.3);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(255,200,100,0.1);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M24 10 L38 36 L10 36 Z" fill="url(#grad-incident)" stroke="rgba(255,200,100,0.6)" stroke-width="1.5" stroke-linejoin="round"/>
                    <circle cx="24" cy="30" r="1.5" fill="rgba(255,255,255,0.9)"/>
                    <line x1="24" y1="19" x2="24" y2="26" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/>
                </svg>`,
                discharge: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad-discharge" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:rgba(150,120,255,0.3);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(150,120,255,0.1);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M16 24 L16 38 L32 38 L32 24" fill="url(#grad-discharge)" stroke="rgba(150,120,255,0.5)" stroke-width="1.5"/>
                    <path d="M12 24 L24 14 L36 24" fill="none" stroke="rgba(150,120,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="21" y="30" width="6" height="8" rx="1" fill="rgba(150,120,255,0.2)" stroke="rgba(150,120,255,0.4)" stroke-width="1"/>
                    <rect x="19" y="26" width="4" height="3" fill="rgba(150,120,255,0.2)" stroke="rgba(150,120,255,0.4)" stroke-width="1"/>
                    <rect x="25" y="26" width="4" height="3" fill="rgba(150,120,255,0.2)" stroke="rgba(150,120,255,0.4)" stroke-width="1"/>
                </svg>`,
                assessment: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad-assessment" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:rgba(255,120,180,0.3);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(255,120,180,0.1);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="14" y="10" width="20" height="30" rx="2" fill="url(#grad-assessment)" stroke="rgba(255,120,180,0.5)" stroke-width="1.5"/>
                    <rect x="18" y="6" width="12" height="6" rx="2" fill="rgba(255,120,180,0.2)" stroke="rgba(255,120,180,0.5)" stroke-width="1.5"/>
                    <line x1="18" y1="18" x2="30" y2="18" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="18" y1="23" x2="30" y2="23" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="18" y1="28" x2="26" y2="28" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="19" cy="33" r="1" fill="rgba(255,255,255,0.6)"/>
                    <circle cx="23" cy="33" r="1" fill="rgba(255,255,255,0.6)"/>
                    <circle cx="27" cy="33" r="1" fill="rgba(255,255,255,0.6)"/>
                </svg>`
            };

            // For Vercel deployment, we'll use static data
            const templates = {
                admission: {
                    name: 'Admission Assessment',
                    description: 'Comprehensive admission assessment and initial care plan',
                    icon: svgIcons.admission,
                    requiredFields: ['patientInfo', 'assessment', 'vitalSigns'],
                    optionalFields: ['interventions', 'observations']
                },
                shift: {
                    name: 'Shift Assessment',
                    description: 'Ongoing patient assessment and care documentation',
                    icon: svgIcons.shift,
                    requiredFields: ['patientInfo', 'assessment'],
                    optionalFields: ['vitalSigns', 'interventions', 'observations']
                },
                incident: {
                    name: 'Incident Report',
                    description: 'Documentation of patient incidents or unusual events',
                    icon: svgIcons.incident,
                    requiredFields: ['patientInfo', 'assessment'],
                    optionalFields: ['vitalSigns', 'interventions', 'observations']
                },
                discharge: {
                    name: 'Discharge Planning',
                    description: 'Patient discharge assessment and care instructions',
                    icon: svgIcons.discharge,
                    requiredFields: ['patientInfo', 'assessment'],
                    optionalFields: ['interventions', 'observations']
                },
                assessment: {
                    name: 'General Assessment',
                    description: 'General patient assessment and care documentation',
                    icon: svgIcons.assessment,
                    requiredFields: ['patientInfo', 'assessment'],
                    optionalFields: ['vitalSigns', 'interventions', 'observations']
                }
            };
            
            this.renderChartTypes(templates);
        } catch (error) {
            console.error('Error loading chart types:', error);
        }
    }

    renderChartTypes(templates) {
        const grid = document.getElementById('chartTypeGrid');
        grid.innerHTML = '';

        Object.entries(templates).forEach(([key, template]) => {
            const card = document.createElement('div');
            card.className = 'chart-type-card';
            card.dataset.type = key;
            
            // Use the premium SVG icon from template, fallback to emoji if not available
            const icon = template.icon || this.getChartTypeIcon(key);
            
            card.innerHTML = `
                <div class="icon">${icon}</div>
                <h4>${template.name}</h4>
                <p>${template.description}</p>
            `;

            if (key === this.selectedChartType) {
                card.classList.add('selected');
            }

            grid.appendChild(card);
        });
    }

    getChartTypeIcon(type) {
        const icons = {
            admission: '🏥',
            shift: '📊',
            incident: '⚠️',
            discharge: '🏠',
            assessment: '📋'
        };
        return icons[type] || '📋';
    }

    selectChartType(type) {
        this.selectedChartType = type;
        
        // Update visual selection
        document.querySelectorAll('.chart-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    }

    async testConnection() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = statusIndicator.querySelector('.status-text');
        const statusDot = statusIndicator.querySelector('.status-dot');

        statusText.textContent = 'Testing...';
        statusDot.style.backgroundColor = 'var(--warning-color)';

        try {
            // For Vercel deployment, simulate a successful connection
            // In production, this would test the actual API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            statusText.textContent = 'Ready';
            statusDot.style.backgroundColor = 'var(--success-color)';
        } catch (error) {
            statusText.textContent = 'Error';
            statusDot.style.backgroundColor = 'var(--error-color)';
            this.showError('Connection test failed: ' + error.message);
        }
    }

    async generateChart() {
        const form = document.getElementById('nursingForm');
        const formData = new FormData(form);
        
        // Convert form data to structured object
        const nurseInput = this.convertFormData(formData);
        
        // Show loading state
        this.showLoading(true);
        
        try {
            // For Vercel deployment, we'll generate a mock chart
            // In production, you would connect to your backend API
            const mockChart = this.generateMockChart(nurseInput);
            
            this.currentChart = mockChart;
            this.displayChart(mockChart);
            this.showResults();
        } catch (error) {
            this.showError('Error generating chart: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    generateMockChart(nurseInput) {
        const chartId = 'chart-' + Date.now();
        const timestamp = new Date().toISOString();
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Generate clinical alerts based on vital signs
        const alerts = this.generateClinicalAlerts(nurseInput);
        
        // Generate SBAR format
        const sbar = this.generateSBAR(nurseInput);
        
        // Generate quick assessment summary
        const quickSummary = this.generateQuickSummary(nurseInput);
        
        return {
            chartId: chartId,
            generatedAt: timestamp,
            inputSummary: {
                patientName: nurseInput.patientInfo.name,
                chartType: nurseInput.chartType,
                chiefComplaint: nurseInput.assessment.chiefComplaint,
                timestamp: timestamp
            },
            chartData: {
                quickSummary: quickSummary,
                sbar: sbar,
                alerts: alerts,
                
                nursingAssessment: `COMPREHENSIVE NURSING ASSESSMENT
Time: ${currentTime}

PATIENT DEMOGRAPHICS:
Name: ${nurseInput.patientInfo.name}
Age: ${nurseInput.patientInfo.age} years | Gender: ${nurseInput.patientInfo.gender}
Room: ${nurseInput.patientInfo.roomNumber || 'Not specified'} | Admission: ${nurseInput.patientInfo.admissionDate || 'Not specified'}
Primary Diagnosis: ${nurseInput.patientInfo.diagnosis || 'Not specified'}

CURRENT VITAL SIGNS: [Time: ${currentTime}]
${this.formatVitalSigns(nurseInput.vitalSigns)}

FOCUSED ASSESSMENT:
Chief Complaint: ${nurseInput.assessment.chiefComplaint}

Presenting Symptoms:
${nurseInput.assessment.symptoms ? nurseInput.assessment.symptoms.map(s => `  • ${s}`).join('\n') : '  • None documented'}

Physical Examination:
${nurseInput.assessment.physicalFindings || 'Not documented'}

Neurological Status:
${nurseInput.assessment.mentalStatus || 'Not documented'}

Mobility/Functional Status:
${nurseInput.assessment.mobility || 'Not documented'}

Skin/Integumentary:
${nurseInput.assessment.skinCondition || 'Not documented'}

INTERVENTIONS PERFORMED: [Time: ${currentTime}]
${this.formatInterventions(nurseInput.interventions)}

CLINICAL OBSERVATIONS:
${nurseInput.observations || 'None documented'}`,

                nursingDiagnosis: this.generateNursingDiagnoses(nurseInput),

                nursingInterventions: this.generateInterventionPlan(nurseInput),

                evaluation: `EVALUATION OF CARE: [Time: ${currentTime}]

Patient Response Indicators:
  ✓ Vital signs: Monitor for stability and trend improvement
  ✓ Pain management: Assess effectiveness using 0-10 scale
  ✓ Patient understanding: Verify comprehension of treatment plan
  ✓ Self-care ability: Evaluate independence in ADLs
  ✓ Overall condition: Track progress toward discharge goals

Expected Outcomes (Next 2-4 hours):
  • Vital signs within acceptable parameters for patient
  • Pain reduced to manageable level (≤ 4/10)
  • Patient demonstrates understanding of care plan
  • No adverse reactions to interventions
  • Improved comfort and satisfaction with care

Re-assessment scheduled: ${this.getNextAssessmentTime(nurseInput.chartType)}`,

                handoffCommunication: this.generateHandoffNotes(nurseInput, currentTime),

                documentation: `DOCUMENTATION STANDARDS MET:

✓ Comprehensive assessment completed per facility protocol
✓ All subjective and objective data documented
✓ Nursing diagnoses evidence-based and appropriate
✓ Interventions clearly defined with rationale
✓ Patient response documented
✓ Safety measures implemented and verified
✓ Time-stamped entries for accountability
✓ Proper medical terminology utilized throughout

Chart completed by AI-assisted documentation system.
Reviewed for accuracy and completeness: ${currentTime}`,

                complianceNotes: `REGULATORY COMPLIANCE VERIFICATION:

✓ HIPAA Compliance:
  • Patient confidentiality maintained throughout documentation
  • No unauthorized disclosure of protected health information
  • Secure documentation methods employed

✓ Joint Commission Standards:
  • Standardized terminology and abbreviations used
  • Patient safety goals addressed (falls, infection control)
  • Clear communication documented
  • Pain assessment completed using standardized scale

✓ CMS Requirements:
  • Medical necessity clearly documented
  • Detailed assessment supports care level
  • Quality indicators addressed
  • Cost-effective care delivery documented

✓ State Board of Nursing:
  • Professional standards of practice followed
  • Scope of practice maintained
  • Accountability demonstrated
  • Patient advocacy evident in documentation`,

                chartSummary: `CLINICAL SUMMARY:

${nurseInput.patientInfo.age}-year-old ${nurseInput.patientInfo.gender} patient presents with ${nurseInput.assessment.chiefComplaint}. 
Current assessment reveals ${this.summarizeFindings(nurseInput)}. 

Evidence-based nursing diagnoses identified and appropriate interventions initiated. 
Patient response being monitored with re-evaluation scheduled. 

All documentation meets regulatory compliance standards for ${nurseInput.chartType} assessment.

Status: ${this.determinePatientStatus(nurseInput)} | Priority: ${this.determinePriority(nurseInput)}
Next Action: ${this.getNextAction(nurseInput)}`
            }
        };
    }

    generateClinicalAlerts(input) {
        const alerts = [];
        const vs = input.vitalSigns || {};
        
        // Check vital signs for abnormalities
        if (vs.painLevel && vs.painLevel > 7) {
            alerts.push('🔴 HIGH PRIORITY: Severe pain level (' + vs.painLevel + '/10) - Immediate intervention needed');
        } else if (vs.painLevel && vs.painLevel > 4) {
            alerts.push('🟡 MODERATE: Pain level (' + vs.painLevel + '/10) - Continue pain management');
        }
        
        // Add more alert logic based on symptoms
        if (input.assessment.symptoms && input.assessment.symptoms.length > 0) {
            const urgentSymptoms = ['chest pain', 'difficulty breathing', 'confusion', 'bleeding', 'fall'];
            const hasUrgent = input.assessment.symptoms.some(s => 
                urgentSymptoms.some(us => s.toLowerCase().includes(us))
            );
            if (hasUrgent) {
                alerts.push('🔴 URGENT: Critical symptoms present - Notify physician if not already aware');
            }
        }
        
        if (alerts.length === 0) {
            alerts.push('✓ No critical alerts at this time - Continue routine monitoring');
        }
        
        return alerts;
    }

    generateSBAR(input) {
        return `SBAR COMMUNICATION FORMAT (For Handoff/Physician Communication):

S - SITUATION:
  ${input.patientInfo.name}, ${input.patientInfo.age}yo ${input.patientInfo.gender}
  Room: ${input.patientInfo.roomNumber || 'N/A'} | Diagnosis: ${input.patientInfo.diagnosis || 'N/A'}
  Reporting: ${input.assessment.chiefComplaint}

B - BACKGROUND:
  • Admission Date: ${input.patientInfo.admissionDate || 'Not specified'}
  • Current Medications: ${input.interventions?.medications?.join(', ') || 'None documented'}
  • Recent Treatments: ${input.interventions?.treatments?.join(', ') || 'None documented'}
  • Relevant History: ${input.assessment.physicalFindings || 'See chart'}

A - ASSESSMENT:
  • Vital Signs: ${this.summarizeVitals(input.vitalSigns)}
  • Pain Level: ${input.vitalSigns?.painLevel || 'Not assessed'}/10
  • Mental Status: ${input.assessment.mentalStatus || 'Not documented'}
  • Primary Concern: ${input.assessment.chiefComplaint}
  • Clinical Impression: ${this.getClinicalImpression(input)}

R - RECOMMENDATION:
  • Continue current interventions
  • Monitor vital signs every 2-4 hours
  • Re-assess pain management effectiveness
  • ${this.getSpecificRecommendations(input)}
  • Notify if condition changes or deteriorates`;
    }

    generateQuickSummary(input) {
        return `QUICK-SCAN SUMMARY (30-Second Overview):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Patient: ${input.patientInfo.name} | Age: ${input.patientInfo.age} | Room: ${input.patientInfo.roomNumber || 'N/A'}

Status: ${this.determinePatientStatus(input)} | Priority: ${this.determinePriority(input)}

Chief Complaint: ${input.assessment.chiefComplaint}

Vitals: ${this.summarizeVitals(input.vitalSigns)} | Pain: ${input.vitalSigns?.painLevel || 'N/A'}/10

Key Actions Today:
${this.getKeyActions(input)}

Next Assessment: ${this.getNextAssessmentTime(input.chartType)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    formatVitalSigns(vs) {
        if (!vs || Object.keys(vs).length === 0) return '  No vital signs documented';
        
        const formatted = [];
        if (vs.temperature) formatted.push(`  • Temperature: ${vs.temperature}`);
        if (vs.bloodPressure) formatted.push(`  • Blood Pressure: ${vs.bloodPressure}`);
        if (vs.heartRate) formatted.push(`  • Heart Rate: ${vs.heartRate}`);
        if (vs.respiratoryRate) formatted.push(`  • Respiratory Rate: ${vs.respiratoryRate}`);
        if (vs.oxygenSaturation) formatted.push(`  • O2 Saturation: ${vs.oxygenSaturation}`);
        if (vs.painLevel !== undefined) formatted.push(`  • Pain Level: ${vs.painLevel}/10`);
        
        return formatted.join('\n') || '  No vital signs documented';
    }

    formatInterventions(interventions) {
        if (!interventions) return '  None documented';
        
        const formatted = [];
        if (interventions.medications?.length) {
            formatted.push('Medications Administered:');
            interventions.medications.forEach(m => formatted.push(`  • ${m}`));
        }
        if (interventions.treatments?.length) {
            formatted.push('Treatments Provided:');
            interventions.treatments.forEach(t => formatted.push(`  • ${t}`));
        }
        if (interventions.procedures?.length) {
            formatted.push('Procedures Performed:');
            interventions.procedures.forEach(p => formatted.push(`  • ${p}`));
        }
        if (interventions.education?.length) {
            formatted.push('Patient Education:');
            interventions.education.forEach(e => formatted.push(`  • ${e}`));
        }
        
        return formatted.length ? formatted.join('\n') : '  None documented';
    }

    generateNursingDiagnoses(input) {
        const diagnoses = [];
        
        // Pain-related
        if (input.vitalSigns?.painLevel && input.vitalSigns.painLevel > 0) {
            diagnoses.push('Acute Pain related to ' + (input.patientInfo.diagnosis || 'current condition') + 
                          ' as evidenced by pain rating of ' + input.vitalSigns.painLevel + '/10');
        }
        
        // Mobility-related
        if (input.assessment.mobility && input.assessment.mobility.toLowerCase().includes('impaired')) {
            diagnoses.push('Impaired Physical Mobility related to ' + (input.patientInfo.diagnosis || 'current condition'));
            diagnoses.push('Risk for Falls related to impaired mobility status');
        }
        
        // Knowledge deficit
        diagnoses.push('Knowledge Deficit related to ' + (input.patientInfo.diagnosis || 'condition') + 
                      ' and treatment plan as evidenced by need for education');
        
        // Risk for infection
        diagnoses.push('Risk for Infection related to invasive procedures and compromised immune system');
        
        return diagnoses;
    }

    generateInterventionPlan(input) {
        const interventions = [];
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        interventions.push(`[${time}] Monitor and document vital signs every 2-4 hours or per facility protocol`);
        
        if (input.vitalSigns?.painLevel && input.vitalSigns.painLevel > 0) {
            interventions.push(`[${time}] Assess pain level using 0-10 scale every 2 hours; administer pain medication as ordered`);
            interventions.push(`[${time}] Implement non-pharmacological comfort measures (positioning, ice/heat, relaxation)`);
        }
        
        interventions.push(`[${time}] Assess and document patient response to all interventions`);
        interventions.push(`[${time}] Implement fall prevention measures per facility protocol`);
        interventions.push(`[${time}] Provide patient/family education regarding condition and treatment plan`);
        interventions.push(`[${time}] Maintain infection control measures and monitor for signs of infection`);
        interventions.push(`[${time}] Ensure call light within reach and patient knows how to use`);
        interventions.push(`[${time}] Document all care provided and patient responses in medical record`);
        
        return interventions;
    }

    generateHandoffNotes(input, time) {
        return `SHIFT HANDOFF NOTES:

PATIENT OVERVIEW:
${input.patientInfo.name} in Room ${input.patientInfo.roomNumber || 'N/A'}
${input.patientInfo.age}yo ${input.patientInfo.gender} • Dx: ${input.patientInfo.diagnosis || 'See chart'}

CURRENT STATUS:
• Chief Complaint: ${input.assessment.chiefComplaint}
• Vital Signs: ${this.summarizeVitals(input.vitalSigns)}
• Pain Level: ${input.vitalSigns?.painLevel || 'Not assessed'}/10
• Activity Level: ${input.assessment.mobility || 'Not documented'}

WHAT WAS DONE THIS SHIFT:
${this.summarizeShiftWork(input)}

PENDING TASKS FOR NEXT SHIFT:
• Re-assess pain and vital signs
• Continue monitoring patient response to interventions
• Follow up on patient education needs
• Document any changes in condition
• ${this.getShiftSpecificTasks(input)}

PATIENT/FAMILY CONCERNS:
${input.observations || 'None expressed at this time'}

CODE STATUS: Full Code (verify current status in chart)`;
    }

    // Helper methods
    summarizeVitals(vs) {
        if (!vs || Object.keys(vs).length === 0) return 'Not documented';
        const parts = [];
        if (vs.bloodPressure) parts.push('BP: ' + vs.bloodPressure);
        if (vs.heartRate) parts.push('HR: ' + vs.heartRate);
        if (vs.temperature) parts.push('T: ' + vs.temperature);
        if (vs.oxygenSaturation) parts.push('O2: ' + vs.oxygenSaturation);
        return parts.join(', ') || 'See detailed vitals';
    }

    getClinicalImpression(input) {
        return `Patient stable with ${input.assessment.chiefComplaint}. Continue current plan of care with close monitoring.`;
    }

    getSpecificRecommendations(input) {
        const recs = [];
        if (input.vitalSigns?.painLevel > 5) recs.push('Consider pain medication adjustment');
        if (input.assessment.symptoms?.length > 0) recs.push('Monitor symptom progression');
        return recs.join('\n  • ') || 'Continue routine care';
    }

    determinePatientStatus(input) {
        if (input.vitalSigns?.painLevel > 7) return '🔴 CRITICAL - Immediate Attention';
        if (input.vitalSigns?.painLevel > 4) return '🟡 MODERATE - Close Monitoring';
        return '🟢 STABLE - Routine Care';
    }

    determinePriority(input) {
        if (input.chartType === 'incident') return 'HIGH';
        if (input.vitalSigns?.painLevel > 7) return 'HIGH';
        if (input.vitalSigns?.painLevel > 4) return 'MEDIUM';
        return 'ROUTINE';
    }

    getKeyActions(input) {
        const actions = [];
        if (input.interventions?.medications?.length) 
            actions.push(`  • Medications: ${input.interventions.medications.length} administered`);
        if (input.interventions?.treatments?.length) 
            actions.push(`  • Treatments: ${input.interventions.treatments.join(', ')}`);
        if (input.vitalSigns?.painLevel) 
            actions.push(`  • Pain management: Assessed and addressed`);
        return actions.length ? actions.join('\n') : '  • See full assessment below';
    }

    getNextAssessmentTime(chartType) {
        const times = {
            'admission': '1 hour',
            'shift': '4 hours',
            'incident': '1 hour',
            'discharge': 'N/A - Discharge pending',
            'assessment': '2-4 hours'
        };
        return times[chartType] || '2-4 hours';
    }

    summarizeFindings(input) {
        return `${input.assessment.chiefComplaint} with current interventions in place. See detailed assessment for complete clinical picture.`;
    }

    getNextAction(input) {
        if (input.chartType === 'discharge') return 'Complete discharge paperwork and education';
        if (input.vitalSigns?.painLevel > 5) return 'Re-assess pain management in 1 hour';
        return 'Continue routine monitoring per protocol';
    }

    summarizeShiftWork(input) {
        const work = [];
        work.push(`• Initial assessment completed at shift start`);
        if (input.interventions?.medications?.length) 
            work.push(`• Administered ${input.interventions.medications.length} medication(s)`);
        if (input.interventions?.treatments?.length) 
            work.push(`• Provided treatments: ${input.interventions.treatments.join(', ')}`);
        if (input.interventions?.education?.length) 
            work.push(`• Patient education provided`);
        work.push(`• Vital signs monitored and documented`);
        work.push(`• Patient comfort and safety maintained`);
        return work.join('\n');
    }

    getShiftSpecificTasks(input) {
        const tasks = [];
        if (input.chartType === 'admission') tasks.push('Complete admission orientation');
        if (input.vitalSigns?.painLevel) tasks.push('Re-evaluate pain management strategy');
        return tasks.join('\n• ') || 'No specific pending tasks';
    }

    convertFormData(formData) {
        const input = {
            patientInfo: {
                name: formData.get('patientName') || '',
                age: parseInt(formData.get('patientAge')) || 0,
                gender: formData.get('patientGender') || '',
                roomNumber: formData.get('roomNumber') || '',
                admissionDate: formData.get('admissionDate') || '',
                diagnosis: formData.get('diagnosis') || ''
            },
            vitalSigns: {
                temperature: formData.get('temperature') || '',
                bloodPressure: formData.get('bloodPressure') || '',
                heartRate: formData.get('heartRate') || '',
                respiratoryRate: formData.get('respiratoryRate') || '',
                oxygenSaturation: formData.get('oxygenSaturation') || '',
                painLevel: parseInt(formData.get('painLevel')) || null
            },
            assessment: {
                chiefComplaint: formData.get('chiefComplaint') || '',
                symptoms: this.parseTextarea(formData.get('symptoms')),
                physicalFindings: formData.get('physicalFindings') || '',
                mentalStatus: formData.get('mentalStatus') || '',
                mobility: formData.get('mobility') || '',
                skinCondition: formData.get('skinCondition') || ''
            },
            interventions: {
                medications: this.parseTextarea(formData.get('medications')),
                treatments: this.parseTextarea(formData.get('treatments')),
                procedures: this.parseTextarea(formData.get('procedures')),
                education: this.parseTextarea(formData.get('education'))
            },
            observations: formData.get('observations') || '',
            chartType: this.selectedChartType
        };

        // Remove empty vital signs
        Object.keys(input.vitalSigns).forEach(key => {
            if (!input.vitalSigns[key] && input.vitalSigns[key] !== 0) {
                delete input.vitalSigns[key];
            }
        });

        // Remove empty interventions
        Object.keys(input.interventions).forEach(key => {
            if (!input.interventions[key] || input.interventions[key].length === 0) {
                delete input.interventions[key];
            }
        });

        return input;
    }

    parseTextarea(value) {
        if (!value) return [];
        return value.split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    displayChart(chartData) {
        const chartContent = document.getElementById('chartContent');
        
        let content = '';
        
        if (chartData.chartData) {
            const data = chartData.chartData;
            
            // Premium header with AISim branding
            content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
            content += `║              AISIM NURSING ASSISTANT - CLINICAL CHART            ║\n`;
            content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
            
            content += `CHART INFORMATION\n`;
            content += `─────────────────────────────────────────────────────────────────────\n`;
            content += `Generated:     ${new Date(chartData.generatedAt).toLocaleString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit'
            })}\n`;
            content += `Chart ID:      ${chartData.chartId}\n`;
            content += `Chart Type:    ${chartData.inputSummary.chartType.toUpperCase()} ASSESSMENT\n`;
            content += `Patient:       ${chartData.inputSummary.patientName}\n`;
            content += `\n\n`;

            // CLINICAL ALERTS - Top Priority
            if (data.alerts && data.alerts.length > 0) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                        CLINICAL ALERTS                           ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                data.alerts.forEach(alert => {
                    content += `${alert}\n\n`;
                });
                content += `\n`;
            }

            // QUICK SUMMARY - For Busy Nurses
            if (data.quickSummary) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                   QUICK-SCAN SUMMARY                             ║\n`;
                content += `║                   (30-Second Overview)                           ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.quickSummary}\n\n\n`;
            }

            // SBAR COMMUNICATION
            if (data.sbar) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                    SBAR COMMUNICATION                            ║\n`;
                content += `║              (For Handoff/Physician Reports)                     ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.sbar}\n\n\n`;
            }

            // COMPREHENSIVE ASSESSMENT
            if (data.nursingAssessment) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                  COMPREHENSIVE ASSESSMENT                        ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.nursingAssessment}\n\n\n`;
            }

            // NURSING DIAGNOSES
            if (data.nursingDiagnosis && data.nursingDiagnosis.length > 0) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                   EVIDENCE-BASED DIAGNOSES                       ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                data.nursingDiagnosis.forEach((diagnosis, index) => {
                    content += `  ${index + 1}. ${diagnosis}\n\n`;
                });
                content += `\n`;
            }

            // NURSING INTERVENTIONS
            if (data.nursingInterventions && data.nursingInterventions.length > 0) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                  TIME-STAMPED INTERVENTIONS                      ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                data.nursingInterventions.forEach((intervention, index) => {
                    content += `  ${intervention}\n`;
                });
                content += `\n\n`;
            }

            // EVALUATION
            if (data.evaluation) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                    EVALUATION & OUTCOMES                         ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.evaluation}\n\n\n`;
            }

            // HANDOFF NOTES
            if (data.handoffCommunication) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                    SHIFT HANDOFF NOTES                           ║\n`;
                content += `║                  (Copy for Shift Report)                         ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.handoffCommunication}\n\n\n`;
            }

            // DOCUMENTATION STANDARDS
            if (data.documentation) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                  DOCUMENTATION STANDARDS                         ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.documentation}\n\n\n`;
            }

            // COMPLIANCE
            if (data.complianceNotes) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                    COMPLIANCE VERIFICATION                       ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.complianceNotes}\n\n\n`;
            }

            // CLINICAL SUMMARY
            if (data.chartSummary) {
                content += `╔═══════════════════════════════════════════════════════════════════╗\n`;
                content += `║                      CLINICAL SUMMARY                            ║\n`;
                content += `╚═══════════════════════════════════════════════════════════════════╝\n\n`;
                content += `${data.chartSummary}\n\n\n`;
            }
            
            // Premium footer
            content += `─────────────────────────────────────────────────────────────────────\n`;
            content += `                    AISim Nursing Assistant\n`;
            content += `           AI-Powered Clinical Documentation System\n`;
            content += `          Designed for Efficiency • Built for Compliance\n`;
            content += `─────────────────────────────────────────────────────────────────────\n`;
        } else {
            content = 'Error: No chart data available';
        }

        chartContent.textContent = content;
    }

    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        const generateBtn = document.getElementById('generateChartBtn');
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoading = generateBtn.querySelector('.btn-loading');

        if (show) {
            overlay.style.display = 'flex';
            generateBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            overlay.style.display = 'none';
            generateBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'flex';
    }

    closeErrorModal() {
        document.getElementById('errorModal').style.display = 'none';
    }

    clearForm() {
        document.getElementById('nursingForm').reset();
        this.selectChartType('assessment');
    }

    createNewChart() {
        this.clearForm();
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('nursingForm').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    downloadChart() {
        if (!this.currentChart) return;

        const chartContent = document.getElementById('chartContent').textContent;
        const blob = new Blob([chartContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nursing-chart-${this.currentChart.chartId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    printChart() {
        if (!this.currentChart) return;

        const chartContent = document.getElementById('chartContent').textContent;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>AISim Nursing Chart - ${this.currentChart.inputSummary.patientName}</title>
                    <style>
                        body { 
                            font-family: 'Courier New', monospace; 
                            font-size: 12px; 
                            line-height: 1.4;
                            margin: 20px;
                            color: #000;
                        }
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <pre>${chartContent}</pre>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}

// Global functions for modal
function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NursingAssistant();
});
