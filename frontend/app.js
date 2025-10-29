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
            const response = await fetch('/api/charting/templates');
            const data = await response.json();
            
            if (data.success) {
                this.renderChartTypes(data.data);
            }
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
            
            const icon = this.getChartTypeIcon(key);
            
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
            const response = await fetch('/api/charting/test-connection');
            const data = await response.json();

            if (data.success) {
                statusText.textContent = 'Connected';
                statusDot.style.backgroundColor = 'var(--success-color)';
            } else {
                statusText.textContent = 'Error';
                statusDot.style.backgroundColor = 'var(--error-color)';
                this.showError('Connection test failed: ' + (data.error || 'Unknown error'));
            }
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
            const response = await fetch('/api/charting/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nurseInput })
            });

            const data = await response.json();

            if (data.success) {
                this.currentChart = data.data;
                this.displayChart(data.data);
                this.showResults();
            } else {
                this.showError(data.error || 'Failed to generate chart');
            }
        } catch (error) {
            this.showError('Network error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
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
            
            content += `AISIM NURSING CHART\n`;
            content += `Generated: ${new Date(chartData.generatedAt).toLocaleString()}\n`;
            content += `Chart ID: ${chartData.chartId}\n`;
            content += `Chart Type: ${chartData.inputSummary.chartType.toUpperCase()}\n`;
            content += `Patient: ${chartData.inputSummary.patientName}\n`;
            content += `\n${'='.repeat(60)}\n\n`;

            if (data.nursingAssessment) {
                content += `NURSING ASSESSMENT:\n`;
                content += `${data.nursingAssessment}\n\n`;
            }

            if (data.nursingDiagnosis && data.nursingDiagnosis.length > 0) {
                content += `NURSING DIAGNOSIS:\n`;
                data.nursingDiagnosis.forEach((diagnosis, index) => {
                    content += `${index + 1}. ${diagnosis}\n`;
                });
                content += `\n`;
            }

            if (data.nursingInterventions && data.nursingInterventions.length > 0) {
                content += `NURSING INTERVENTIONS:\n`;
                data.nursingInterventions.forEach((intervention, index) => {
                    content += `${index + 1}. ${intervention}\n`;
                });
                content += `\n`;
            }

            if (data.evaluation) {
                content += `EVALUATION:\n`;
                content += `${data.evaluation}\n\n`;
            }

            if (data.documentation) {
                content += `DOCUMENTATION:\n`;
                content += `${data.documentation}\n\n`;
            }

            if (data.complianceNotes) {
                content += `COMPLIANCE NOTES:\n`;
                content += `${data.complianceNotes}\n\n`;
            }

            if (data.chartSummary) {
                content += `CHART SUMMARY:\n`;
                content += `${data.chartSummary}\n\n`;
            }
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
