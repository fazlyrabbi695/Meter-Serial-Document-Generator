// Global variables to store generated documents
let generatedDocuments = [];
let testFieldCounter = 0;
let currentMeterType = '';

// Configuration Management Functions
function saveConfiguration() {
    const meterType = document.getElementById('meterType').value.trim();
    
    if (!meterType) {
        alert('Please enter a meter type before saving configuration');
        return;
    }
    
    const config = {
        documentTitle: document.getElementById('documentTitle').value,
        companyName: document.getElementById('companyName').value,
        meterSpecification: document.getElementById('meterSpecification').value,
        meterType: meterType,
        modelNo: document.getElementById('modelNo').value,
        relativeHumidity: document.getElementById('relativeHumidity').value,
        technicalSpecs: document.getElementById('technicalSpecs').value,
        additionalTests: getAdditionalTests(),
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage with meter type as key
    const configKey = `meterConfig_${meterType}`;
    localStorage.setItem(configKey, JSON.stringify(config));
    
    // Update saved configs list
    updateSavedConfigsList();
    
    alert(`Configuration saved successfully for: ${meterType}`);
}

function loadConfiguration() {
    const meterType = document.getElementById('meterType').value.trim();
    
    if (!meterType) {
        alert('Please enter a meter type to load its configuration');
        return;
    }
    
    loadConfigByMeterType(meterType);
}

function loadConfigByMeterType(meterType) {
    const configKey = `meterConfig_${meterType}`;
    const savedConfig = localStorage.getItem(configKey);
    
    if (!savedConfig) {
        alert(`No saved configuration found for: ${meterType}`);
        return;
    }
    
    try {
        const config = JSON.parse(savedConfig);
        
        // Load all form fields
        document.getElementById('documentTitle').value = config.documentTitle || 'Meter Test Report';
        document.getElementById('companyName').value = config.companyName || 'Northern Trade International';
        document.getElementById('meterSpecification').value = config.meterSpecification || '3×240/415V  3×10(100)A,50HZ 800imp/kWh\n800imp/Kvarh Class 1.0';
        document.getElementById('meterType').value = config.meterType || 'N.M 787(Three Phase Electronic kWh Meter)';
        document.getElementById('modelNo').value = config.modelNo || 'N.M786 Current 10(100)A Class 1 Temperature 27 ＋/－2 Deg ℃';
        document.getElementById('relativeHumidity').value = config.relativeHumidity || '＜70％';
        document.getElementById('technicalSpecs').value = config.technicalSpecs || 'Voltage 240/415V, Current 10-100A, Accuracy Class 1.00 Ref: Standard IEC-62053-21';
        
        // Load additional tests
        clearAdditionalTests();
        if (config.additionalTests && config.additionalTests.length > 0) {
            config.additionalTests.forEach(test => {
                addTestField(test.test, test.result);
            });
        }
        
        currentMeterType = meterType;
        updateSavedConfigsList();
        
        alert(`Configuration loaded successfully for: ${meterType}`);
    } catch (error) {
        alert('Error loading configuration. The saved data might be corrupted.');
    }
}

function deleteConfiguration() {
    const meterType = document.getElementById('meterType').value.trim();
    
    if (!meterType) {
        alert('Please enter a meter type to delete its configuration');
        return;
    }
    
    const configKey = `meterConfig_${meterType}`;
    const savedConfig = localStorage.getItem(configKey);
    
    if (!savedConfig) {
        alert(`No saved configuration found for: ${meterType}`);
        return;
    }
    
    if (confirm(`Are you sure you want to delete the configuration for: ${meterType}?`)) {
        localStorage.removeItem(configKey);
        updateSavedConfigsList();
        alert(`Configuration deleted successfully for: ${meterType}`);
    }
}

function onMeterTypeChange() {
    const meterType = document.getElementById('meterType').value.trim();
    
    if (meterType && meterType !== currentMeterType) {
        // Auto-load configuration if exists for the new meter type
        const configKey = `meterConfig_${meterType}`;
        const savedConfig = localStorage.getItem(configKey);
        
        if (savedConfig) {
            if (confirm(`A saved configuration exists for "${meterType}". Do you want to load it?`)) {
                loadConfigByMeterType(meterType);
            }
        } else {
            // Reset to defaults for new meter type
            currentMeterType = meterType;
            updateSavedConfigsList();
        }
    }
}

function updateSavedConfigsList() {
    const container = document.getElementById('savedConfigsList');
    const configs = getAllSavedConfigs();
    
    if (configs.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; font-style: italic;">No saved configurations found.</p>';
        return;
    }
    
    let html = '<h4 style="margin-bottom: 10px; color: #495057;">Saved Configurations:</h4>';
    
    configs.forEach(config => {
        const isCurrentConfig = config.meterType === document.getElementById('meterType').value.trim();
        const configClass = isCurrentConfig ? 'config-item current-config' : 'config-item';
        
        html += `
            <div class="${configClass}">
                <span class="config-name">${config.meterType}</span>
                <div class="config-actions">
                    <button class="config-load-btn" onclick="loadConfigByMeterType('${config.meterType.replace(/'/g, "\\'")}')">Load</button>
                    <button class="config-delete-btn" onclick="deleteSpecificConfig('${config.meterType.replace(/'/g, "\\'")}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getAllSavedConfigs() {
    const configs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('meterConfig_')) {
            try {
                const config = JSON.parse(localStorage.getItem(key));
                config.meterType = key.replace('meterConfig_', '');
                configs.push(config);
            } catch (error) {
                console.error('Error parsing config:', key);
            }
        }
    }
    return configs.sort((a, b) => a.meterType.localeCompare(b.meterType));
}

function deleteSpecificConfig(meterType) {
    if (confirm(`Are you sure you want to delete the configuration for: ${meterType}?`)) {
        const configKey = `meterConfig_${meterType}`;
        localStorage.removeItem(configKey);
        updateSavedConfigsList();
        alert(`Configuration deleted successfully for: ${meterType}`);
    }
}

function clearAdditionalTests() {
    document.getElementById('additionalTestsContainer').innerHTML = '';
    testFieldCounter = 0;
}

// Function to add new test field
function addTestField(testName = '', testResult = 'Pass') {
    testFieldCounter++;
    const container = document.getElementById('additionalTestsContainer');
    const testFieldDiv = document.createElement('div');
    testFieldDiv.className = 'test-field-container';
    testFieldDiv.innerHTML = `
        <input type="text" placeholder="Enter test name (e.g., Power Factor Test)" id="testName${testFieldCounter}" value="${testName}">
        <select id="testResult${testFieldCounter}">
            <option value="Pass" ${testResult === 'Pass' ? 'selected' : ''}>Pass</option>
            <option value="Fail" ${testResult === 'Fail' ? 'selected' : ''}>Fail</option>
            <option value="N/A" ${testResult === 'N/A' ? 'selected' : ''}>N/A</option>
        </select>
        <button type="button" class="remove-test-btn" onclick="removeTestField(this)">
            Remove
        </button>
    `;
    container.appendChild(testFieldDiv);
}

// Function to remove test field
function removeTestField(button) {
    button.parentElement.remove();
}

// Function to get additional tests from UI
function getAdditionalTests() {
    const additionalTests = [];
    const container = document.getElementById('additionalTestsContainer');
    const testContainers = container.querySelectorAll('.test-field-container');
    
    testContainers.forEach(container => {
        const testNameInput = container.querySelector('input[id^="testName"]');
        const testResultSelect = container.querySelector('select[id^="testResult"]');
        
        if (testNameInput && testResultSelect && testNameInput.value.trim()) {
            additionalTests.push({
                test: testNameInput.value.trim(),
                result: testResultSelect.value
            });
        }
    });
    
    return additionalTests;
}

// Function to generate documents
async function generateDocuments() {
    const startingSerial = document.getElementById('startingSerial').value.trim();
    const documentCount = parseInt(document.getElementById('documentCount').value) || 20;
    const documentTitle = document.getElementById('documentTitle').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const meterSpecification = document.getElementById('meterSpecification').value.trim();
    const meterType = document.getElementById('meterType').value.trim();
    const modelNo = document.getElementById('modelNo').value.trim();
    const relativeHumidity = document.getElementById('relativeHumidity').value.trim();
    const technicalSpecs = document.getElementById('technicalSpecs').value.trim();
    const marginTop = document.getElementById('marginTop').value || '0.79';
    const marginBottom = document.getElementById('marginBottom').value || '0.79';
    const marginLeft = document.getElementById('marginLeft').value || '0.79';
    const marginRight = document.getElementById('marginRight').value || '1.19';
    const fontSizeCompany = document.getElementById('fontSizeCompany').value || '22';
    const fontSizeSection = document.getElementById('fontSizeSection').value || '22';
    const fontSizeBody = document.getElementById('fontSizeBody').value || '12';
    const fontSizeTable = document.getElementById('fontSizeTable').value || '12';

    // Validation
    if (!startingSerial) {
        alert('Please enter a starting meter serial number');
        return;
    }

    if (documentCount < 1 || documentCount > 100) {
        alert('Please enter a document count between 1 and 100');
        return;
    }

    if (!documentTitle) {
        alert('Please enter a document title');
        return;
    }

    if (!companyName) {
        alert('Please enter a company name');
        return;
    }

    if (!meterSpecification) {
        alert('Please enter meter specification');
        return;
    }

    if (!meterType) {
        alert('Please enter meter type');
        return;
    }

    if (!modelNo) {
        alert('Please enter model number');
        return;
    }

    if (!relativeHumidity) {
        alert('Please enter relative humidity');
        return;
    }

    if (!technicalSpecs) {
        alert('Please enter technical specifications');
        return;
    }

    // Disable generate button and show progress
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('previewSection').style.display = 'none';

    // Clear previous documents
    generatedDocuments = [];

    // Extract numeric part from serial number for increment
    const serialMatch = startingSerial.match(/^([A-Za-z]*)(\d+)([A-Za-z]*)$/);
    let prefix = '';
    let number = 1;
    let suffix = '';

    if (serialMatch) {
        prefix = serialMatch[1];
        number = parseInt(serialMatch[2]);
        suffix = serialMatch[3];
    } else {
        // If no numeric part found, treat entire string as prefix and start from 1
        prefix = startingSerial;
        number = 1;
    }

    // Generate documents based on user-specified count
    for (let i = 0; i < documentCount; i++) {
        const currentSerial = prefix + String(number + i).padStart(3, '0') + suffix;
        const documentData = {
            serialNumber: currentSerial,
            title: documentTitle,
            company: companyName,
            specification: meterSpecification,
            meterType: meterType,
            modelNo: modelNo,
            relativeHumidity: relativeHumidity,
            technicalSpecs: technicalSpecs,
            margins: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight },
            fontSizes: { company: fontSizeCompany, section: fontSizeSection, body: fontSizeBody, table: fontSizeTable },
            additionalTests: getAdditionalTests(),
            date: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            documentNumber: `DOC-${String(i + 1).padStart(3, '0')}`,
            content: generateDocumentContent(currentSerial, documentTitle, companyName, meterSpecification, meterType, modelNo, relativeHumidity, technicalSpecs, getAdditionalTests())
        };

        generatedDocuments.push(documentData);

        // Update progress
        const progress = ((i + 1) / documentCount) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressText').textContent = `Generating document ${i + 1} of ${documentCount}... (${currentSerial})`;

        // Add small delay to show progress animation
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Show results
    displayDocumentList();
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'block';
}

// Function to generate document content
function generateDocumentContent(serialNumber, title, company, specification, meterType, modelNo, relativeHumidity, technicalSpecs, additionalTests = []) {
    const currentDate = new Date();
    const testDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');
    
    return {
        serialNumber: serialNumber,
        company: company,
        date: testDate,
        meterType: meterType, // Use the meter type from UI
        specification: specification, // Use the specification from UI
        modelNo: modelNo, // Use the model number from UI
        humidity: relativeHumidity, // Use the relative humidity from UI
        technicalSpecs: technicalSpecs, // Use the technical specs from UI
        additionalTests: additionalTests, // Use additional tests from UI
        // Generate test data
        activeErrors: generateErrorData(),
        reactiveErrors: generateReactiveErrorData(),
        testResults: generateTestResults(additionalTests),
        voltage: '240/415V',
        current: '10-100A',
        accuracy: 'Class 1.00',
        reference: 'Standard IEC-62053-21'
    };
}

// Function to generate random error value between -0.2 and 0.2
function generateRandomError() {
    // Generate random value between -0.2 and 0.2, rounded to 1 decimal place
    const value = (Math.random() * 0.4) - 0.2; // Range: -0.2 to 0.2
    return (Math.round(value * 10) / 10).toFixed(1); // Round to 1 decimal and format
}

// Function to generate varied column values (ensures no column has all same values)
function generateVariedColumnValues() {
    const values = [];
    const possibleValues = ['-0.2', '-0.1', '-0.0', '0.0', '0.1', '0.2'];
    
    // Generate 3 different values for a column
    for (let i = 0; i < 3; i++) {
        let newValue;
        let attempts = 0;
        do {
            newValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
            attempts++;
        } while (values.includes(newValue) && attempts < 10); // Ensure variety, but avoid infinite loop
        
        values.push(newValue);
    }
    
    return values;
}

// Function to generate active error data
function generateErrorData() {
    const lag05Values = generateVariedColumnValues();
    const lead08Values = generateVariedColumnValues();
    const upfValues = generateVariedColumnValues();
    
    return [
        { 
            load: '1000', 
            lag05: lag05Values[0], 
            lead08: lead08Values[0], 
            upf: upfValues[0] 
        },
        { 
            load: '100', 
            lag05: lag05Values[1], 
            lead08: lead08Values[1], 
            upf: upfValues[1] 
        },
        { 
            load: '10', 
            lag05: lag05Values[2], 
            lead08: lead08Values[2], 
            upf: upfValues[2] 
        }
    ];
}

// Function to generate reactive error data
function generateReactiveErrorData() {
    const lag05Values = generateVariedColumnValues();
    const lead08Values = generateVariedColumnValues();
    const upfValues = generateVariedColumnValues();
    
    return [
        { 
            load: '1000', 
            lag05: lag05Values[0], 
            lead08: lead08Values[0], 
            upf: upfValues[0] 
        },
        { 
            load: '100', 
            lag05: lag05Values[1], 
            lead08: lead08Values[1], 
            upf: upfValues[1] 
        },
        { 
            load: '10', 
            lag05: lag05Values[2], 
            lead08: lead08Values[2], 
            upf: upfValues[2] 
        }
    ];
}

// Function to generate test results
function generateTestResults(additionalTests = []) {
    const defaultTests = [
        { test: 'AC Voltage Test', result: 'Pass' },
        { test: 'Insulation Resistance Test', result: 'Pass' },
        { test: 'Test Of No Load Condition', result: 'Pass' },
        { test: 'Power Consumption', result: 'Pass' },
        { test: 'Test Of Meter Constant', result: 'Pass' },
        { test: 'Test Of Starting Current Condition', result: 'Pass' }
    ];
    
    // Combine default tests with additional tests
    return [...defaultTests, ...additionalTests];
}

// Function to display document list
function displayDocumentList() {
    const documentList = document.getElementById('documentList');
    documentList.innerHTML = '';

    generatedDocuments.forEach((doc, index) => {
        const documentItem = document.createElement('div');
        documentItem.className = 'document-item';
        documentItem.innerHTML = `
            <h3>Document ${index + 1}</h3>
            <p><strong>Serial Number:</strong> ${doc.serialNumber}</p>
            <p><strong>Title:</strong> ${doc.title}</p>
            <p><strong>Company:</strong> ${doc.company}</p>
            <p><strong>Date:</strong> ${doc.date}</p>
            <button class="download-btn" onclick="downloadDocument(${index})">
                Download HTML
            </button>
            <button class="download-btn" onclick="previewDocument(${index})" style="margin-left: 10px; background: #007bff;">
                Preview
            </button>
        `;
        documentList.appendChild(documentItem);
    });

    document.getElementById('downloadAllBtn').style.display = 'block';
    document.getElementById('previewAllBtn').style.display = 'block';
}

// Function to create A4 formatted document HTML
function createDocumentHTML(docData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meter Test Report - ${docData.serialNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            background: #f5f5f5;
            padding: 10px;
            font-size: 12pt;
        }
        
        .a4-document {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0 auto;
            padding-top: calc(${docData.margins?.top || '0.79'}in);
            padding-bottom: calc(${docData.margins?.bottom || '0.79'}in);
            padding-left: calc(${docData.margins?.left || '0.79'}in);
            padding-right: calc(${docData.margins?.right || '1.19'}in);
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-size: 12pt;
            line-height: 1.3;
            color: #000;
            position: relative;
        }
        
        .document-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: ${docData.fontSizes?.company || '22'}pt;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .meter-info {
            text-align: left;
            margin-bottom: 15px;
            line-height: 1.4;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .meter-info p {
            margin-bottom: 3px;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .section-title {
            text-align: center;
            font-size: ${docData.fontSizes?.section || '22'}pt;
            font-weight: bold;
            margin: 20px 0 15px 0;
        }
        
        .error-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .error-table th,
        .error-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: center;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .error-table th {
            background-color: #f0f0f0;
            font-weight: normal;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .error-table .load-header {
            text-align: left;
            font-weight: normal;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .test-results {
            margin-top: 20px;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .test-line {
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            font-size: 12pt;
        }
        
        .test-line::before {
            content: '•';
            margin-right: 5px;
            flex-shrink: 0;
        }
        
        .test-name {
            flex-grow: 0;
            margin-right: 10px;
        }
        
        .test-dots {
            flex-grow: 1;
            border-bottom: 1px dotted #000;
            height: 1px;
            margin: 0 10px;
        }
        
        .test-result {
            flex-shrink: 0;
        }
        
        .signature-section {
            position: absolute;
            bottom: 10mm;
            left: 15mm;
            right: 15mm;
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .signature-box {
            text-align: center;
            width: 150px;
            font-size: 12pt;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            height: 30px;
        }
        
        .voltage-info {
            margin: 15px 0;
            text-align: center;
            font-size: 12pt;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .a4-document {
                box-shadow: none;
                margin: 0;
                width: 100%;
                min-height: 100vh;
                padding-top: calc(${docData.margins?.top || '0.79'}in) !important;
                padding-bottom: calc(${docData.margins?.bottom || '0.79'}in) !important;
                padding-left: calc(${docData.margins?.left || '0.79'}in) !important;
                padding-right: calc(${docData.margins?.right || '1.19'}in) !important;
            }
            
            @page {
                margin-top: calc(${docData.margins?.top || '0.79'}in);
                margin-bottom: calc(${docData.margins?.bottom || '0.79'}in);
                margin-left: calc(${docData.margins?.left || '0.79'}in);
                margin-right: calc(${docData.margins?.right || '1.19'}in);
                size: A4;
            }
            
            /* Hide browser headers and footers */
            html {
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="a4-document">
        <div class="document-header">
            <div class="company-name">${docData.company}</div>
            
            <div class="meter-info">
                <p>Type: ${docData.content.meterType}</p>
                <p>Specification: ${docData.content.specification}</p>
                <br>
                <p>Meter Serial No: ${docData.content.serialNumber} <span style="float: right;">Date: ${docData.content.date}</span></p>
                <p>Model No: ${docData.content.modelNo}</p>
                <p style="text-align: center; margin-top: 5px;">Relative Humidity &nbsp; ${docData.content.humidity}</p>
            </div>
        </div>
        
        <div class="section-title">Import Mode Errors</div>
        
        <p style="margin-bottom: 10px; font-size: 12pt;">* % Active Errors (Balance Mode 3 Phase 4 Wire)</p>
        
        <table class="error-table">
            <tr>
                <th class="load-header">Load % Ib</th>
                <th>0.5 Lag</th>
                <th>0.8 Lead</th>
                <th>UPF</th>
            </tr>
            ${docData.content.activeErrors.map(row => `
            <tr>
                <td class="load-header">${row.load}</td>
                <td>${row.lag05}</td>
                <td>${row.lead08}</td>
                <td>${row.upf}</td>
            </tr>
            `).join('')}
        </table>
        
        <p style="margin-bottom: 10px; font-size: 12pt;">* % Reactive Errors (Balance Mode 3 Phase 4 Wire)</p>
        
        <table class="error-table">
            <tr>
                <th class="load-header">Load % Ib</th>
                <th>0.5 Lag</th>
                <th>0.8 Lead</th>
                <th>UPF</th>
            </tr>
            ${docData.content.reactiveErrors.map(row => `
            <tr>
                <td class="load-header">${row.load}</td>
                <td>${row.lag05}</td>
                <td>${row.lead08}</td>
                <td>${row.upf}</td>
            </tr>
            `).join('')}
        </table>
        
        <div class="voltage-info">
            <p>${docData.content.technicalSpecs}</p>
        </div>
        
        <div class="test-results">
            ${docData.content.testResults.map(test => `
            <div class="test-line">
                <span class="test-name">${test.test}</span>
                <div class="test-dots"></div>
                <span class="test-result">: ${test.result}</span>
            </div>
            `).join('')}
        </div>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <p>Tested By:</p>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <p>Checked By:</p>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <p>Approved By:</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Function to download individual document
function downloadDocument(index) {
    const docData = generatedDocuments[index];
    const htmlContent = createDocumentHTML(docData);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docData.title.replace(/\s+/g, '_')}_${docData.serialNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to create combined document HTML
function createCombinedDocumentHTML() {
    if (generatedDocuments.length === 0) {
        return '';
    }
    
    const firstDoc = generatedDocuments[0];
    const combinedContent = generatedDocuments.map((docData, index) => {
        return `
        <div class="document-page" style="
            ${index > 0 ? 'page-break-before: always;' : ''}
            margin-bottom: 30mm;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20mm;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
            <div class="document-header">
                <div class="company-name">${docData.company}</div>
                
                <div class="meter-info">
                    <p>Type: ${docData.content.meterType}</p>
                    <p>Specification: ${docData.content.specification}</p>
                    <br>
                    <p>Meter Serial No: ${docData.content.serialNumber} <span style="float: right;">Date: ${docData.content.date}</span></p>
                    <p>Model No: ${docData.content.modelNo}</p>
                    <p style="text-align: center; margin-top: 5px;">Relative Humidity &nbsp; ${docData.content.humidity}</p>
                </div>
            </div>
            
            <div class="section-title">Import Mode Errors</div>
            
            <p style="margin-bottom: 10px; font-size: ${firstDoc.fontSizes?.body || '12'}pt;">* % Active Errors (Balance Mode 3 Phase 4 Wire)</p>
            
            <table class="error-table">
                <tr>
                    <th class="load-header">Load % Ib</th>
                    <th>0.5 Lag</th>
                    <th>0.8 Lead</th>
                    <th>UPF</th>
                </tr>
                ${docData.content.activeErrors.map(row => `
                <tr>
                    <td class="load-header">${row.load}</td>
                    <td>${row.lag05}</td>
                    <td>${row.lead08}</td>
                    <td>${row.upf}</td>
                </tr>
                `).join('')}
            </table>
            
            <p style="margin-bottom: 10px; font-size: ${firstDoc.fontSizes?.body || '12'}pt;">* % Reactive Errors (Balance Mode 3 Phase 4 Wire)</p>
            
            <table class="error-table">
                <tr>
                    <th class="load-header">Load % Ib</th>
                    <th>0.5 Lag</th>
                    <th>0.8 Lead</th>
                    <th>UPF</th>
                </tr>
                ${docData.content.reactiveErrors.map(row => `
                <tr>
                    <td class="load-header">${row.load}</td>
                    <td>${row.lag05}</td>
                    <td>${row.lead08}</td>
                    <td>${row.upf}</td>
                </tr>
                `).join('')}
            </table>
            
            <div class="voltage-info">
                <p>${docData.content.technicalSpecs}</p>
            </div>
            
            <div class="test-results">
                ${docData.content.testResults.map(test => `
                <div class="test-line">
                    <span class="test-name">${test.test}</span>
                    <div class="test-dots"></div>
                    <span class="test-result">: ${test.result}</span>
                </div>
                `).join('')}
            </div>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <p>Tested By:</p>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <p>Checked By:</p>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <p>Approved By:</p>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Create the full HTML with enhanced print styles
    const baseHTML = createDocumentHTML(firstDoc);
    const enhancedHTML = baseHTML.replace(
        /<style>[\s\S]*?<\/style>/,
        `<style>
        ${getEnhancedCombinedStyles(firstDoc)}
        </style>`
    ).replace(
        /<div class="a4-document">[\s\S]*<\/div>\s*<\/body>/,
        `<div class="combined-document-container">
            <div class="combined-document">${combinedContent}</div>
        </div></body>`
    );
    
    return enhancedHTML;
}

// Function to preview document
function previewDocument(index) {
    const docData = generatedDocuments[index];
    const htmlContent = createDocumentHTML(docData);
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
}

// Function to download all documents
function downloadAllDocuments() {
    if (generatedDocuments.length === 0) {
        alert('No documents to download');
        return;
    }

    // Create combined document
    const combinedHTML = createCombinedDocumentHTML();
    const firstDoc = generatedDocuments[0];
    const filename = `${firstDoc.title.replace(/\s+/g, '_')}_Combined_${generatedDocuments.length}_Documents.html`;
    
    const blob = new Blob([combinedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Combined document with ${generatedDocuments.length} reports downloaded successfully!`);
}

// Function to get enhanced combined document styles
function getEnhancedCombinedStyles(docData) {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            background: #f5f5f5;
            padding: 20px;
            font-size: 12pt;
        }
        
        .combined-document-container {
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .combined-document {
            background: #f9f9f9;
            padding: 20px;
        }
        
        .document-page {
            width: 100%;
            min-height: 297mm;
            background: white;
            position: relative;
        }
        
        .document-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: ${docData.fontSizes?.company || '22'}pt;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .meter-info {
            text-align: left;
            margin-bottom: 15px;
            line-height: 1.4;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .meter-info p {
            margin-bottom: 3px;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .section-title {
            text-align: center;
            font-size: ${docData.fontSizes?.section || '22'}pt;
            font-weight: bold;
            margin: 20px 0 15px 0;
        }
        
        .error-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .error-table th,
        .error-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: center;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .error-table th {
            background-color: #f0f0f0;
            font-weight: normal;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .error-table .load-header {
            text-align: left;
            font-weight: normal;
            font-size: ${docData.fontSizes?.table || '12'}pt;
        }
        
        .test-results {
            margin-top: 20px;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .test-line {
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .test-line::before {
            content: '•';
            margin-right: 5px;
            flex-shrink: 0;
        }
        
        .test-name {
            flex-grow: 0;
            margin-right: 10px;
        }
        
        .test-dots {
            flex-grow: 1;
            border-bottom: 1px dotted #000;
            height: 1px;
            margin: 0 10px;
        }
        
        .test-result {
            flex-shrink: 0;
        }
        
        .signature-section {
            position: absolute;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .signature-box {
            text-align: center;
            width: 150px;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            height: 30px;
        }
        
        .voltage-info {
            margin: 15px 0;
            text-align: center;
            font-size: ${docData.fontSizes?.body || '12'}pt;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .combined-document-container {
                max-width: 100%;
            }
            
            .combined-document {
                background: white;
                padding: 0;
            }
            
            .document-page {
                border: none !important;
                box-shadow: none !important;
                margin-bottom: 0 !important;
                padding: calc(${docData.margins?.top || '0.79'}in) calc(${docData.margins?.right || '1.19'}in) calc(${docData.margins?.bottom || '0.79'}in) calc(${docData.margins?.left || '0.79'}in) !important;
                border-radius: 0 !important;
            }
            
            @page {
                margin-top: calc(${docData.margins?.top || '0.79'}in);
                margin-bottom: calc(${docData.margins?.bottom || '0.79'}in);
                margin-left: calc(${docData.margins?.left || '0.79'}in);
                margin-right: calc(${docData.margins?.right || '1.19'}in);
                size: A4;
            }
            
            .signature-section {
                bottom: 20mm !important;
            }
            
            html {
                -webkit-print-color-adjust: exact;
            }
        }
        
        @media screen {
            .document-page:not(:last-child) {
                margin-bottom: 30mm !important;
            }
        }
    `;
}
function previewCombinedDocument() {
    if (generatedDocuments.length === 0) {
        alert('No documents to preview');
        return;
    }
    
    const combinedHTML = createCombinedDocumentHTML();
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(combinedHTML);
    previewWindow.document.close();
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Auto-focus on the serial number input
    document.getElementById('startingSerial').focus();
    
    // Load saved configurations list
    updateSavedConfigsList();
    
    // Set initial current meter type
    currentMeterType = document.getElementById('meterType').value.trim();
    
    // Try to auto-load configuration for default meter type
    if (currentMeterType) {
        const configKey = `meterConfig_${currentMeterType}`;
        const savedConfig = localStorage.getItem(configKey);
        if (savedConfig) {
            loadConfigByMeterType(currentMeterType);
        }
    }
    
    // Add Enter key support for the form
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !document.getElementById('generateBtn').disabled) {
            generateDocuments();
        }
    });
    
    // Add input validation
    document.getElementById('startingSerial').addEventListener('input', function(e) {
        const value = e.target.value;
        // Remove any invalid characters (keep only letters, numbers, and hyphens)
        e.target.value = value.replace(/[^a-zA-Z0-9\-]/g, '');
    });
});

// Function to reset the form
function resetForm() {
    document.getElementById('startingSerial').value = '';
    document.getElementById('documentTitle').value = 'Meter Test Report';
    document.getElementById('companyName').value = 'Northern Trade International';
    document.getElementById('meterSpecification').value = '3×240/415V  3×10(100)A,50HZ 800imp/kWh\n800imp/Kvarh Class 1.0';
    document.getElementById('meterType').value = 'N.M 787(Three Phase Electronic kWh Meter)';
    document.getElementById('modelNo').value = 'N.M786 Current 10(100)A Class 1 Temperature 27 ＋/－2 Deg ℃';
    document.getElementById('relativeHumidity').value = '＜70％';
    document.getElementById('technicalSpecs').value = 'Voltage 240/415V, Current 10-100A, Accuracy Class 1.00 Ref: Standard IEC-62053-21';
    // Clear additional tests
    clearAdditionalTests();
    currentMeterType = 'N.M 787(Three Phase Electronic kWh Meter)';
    updateSavedConfigsList();
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    generatedDocuments = [];
}