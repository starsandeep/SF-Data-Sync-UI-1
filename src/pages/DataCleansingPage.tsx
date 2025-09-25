import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import '../App.css';

// Types
interface DataObject {
  id: string;
  name: string;
  icon: string;
  description: string;
  recordCount: number;
}

interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  city: string;
  state: string;
  lastModified: string;
}

interface DataIssue {
  id: string;
  type: 'duplicate' | 'missing' | 'invalid' | 'inconsistent' | 'outdated';
  severity: 'critical' | 'warning' | 'info';
  field: string;
  description: string;
  recordIds: string[];
  suggestedFix: string;
}

interface QualityMetrics {
  overallScore: number;
  totalRecords: number;
  cleanRecords: number;
  issuesFound: number;
  duplicates: number;
  missing: number;
  invalid: number;
  inconsistent: number;
  outdated: number;
}

type ProcessingStage = 'object-selection' | 'processing' | 'results';

// Mock Data
const dataObjects: DataObject[] = [
  { id: 'contacts', name: 'Contacts', icon: '👥', description: 'Individual customer and prospect records', recordCount: 2847 },
  { id: 'accounts', name: 'Accounts', icon: '🏢', description: 'Company and organization records', recordCount: 1256 },
  { id: 'opportunities', name: 'Opportunities', icon: '💼', description: 'Sales pipeline and deal records', recordCount: 589 },
  { id: 'leads', name: 'Leads', icon: '🎯', description: 'Potential customer prospects', recordCount: 3421 },
  { id: 'cases', name: 'Cases', icon: '📋', description: 'Support and service requests', recordCount: 967 },
  { id: 'campaigns', name: 'Campaigns', icon: '📢', description: 'Marketing campaign records', recordCount: 234 }
];

const generateMockContacts = (): ContactRecord[] => [
  // Duplicate examples
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0123', company: 'Tech Corp', title: 'Manager', city: 'New York', state: 'NY', lastModified: '2024-01-15' },
  { id: '2', firstName: 'Jon', lastName: 'Smith', email: 'john.smith@email.com', phone: '555-0123', company: 'TechCorp', title: 'Manager', city: 'New York', state: 'NY', lastModified: '2024-01-16' },
  // Missing fields
  { id: '3', firstName: 'Sarah', lastName: 'Johnson', email: '', phone: '555-0456', company: 'Design Studio', title: 'Designer', city: 'Los Angeles', state: 'CA', lastModified: '2024-02-01' },
  { id: '4', firstName: 'Mike', lastName: 'Wilson', email: 'mike@company.com', phone: '', company: '', title: 'Developer', city: 'Seattle', state: 'WA', lastModified: '2024-02-05' },
  // Invalid formats
  { id: '5', firstName: 'JENNIFER', lastName: 'BROWN', email: 'jennifer.invalid-email', phone: '1234567890123', company: 'Marketing Inc', title: 'specialist', city: 'chicago', state: 'il', lastModified: '2024-01-20' },
  { id: '6', firstName: 'david', lastName: 'garcia', email: 'david@email', phone: '555.0789', company: 'sales corp', title: 'SALES REP', city: 'Miami', state: 'florida', lastModified: '2024-02-10' },
  // Inconsistent data
  { id: '7', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@corp.com', phone: '(555) 012-3456', company: 'Anderson & Associates', title: 'Senior Consultant', city: 'Boston', state: 'Massachusetts', lastModified: '2024-02-15' },
  { id: '8', firstName: 'Robert', lastName: 'Taylor', email: 'r.taylor@business.org', phone: '+1-555-567-8901', company: 'Business Solutions LLC', title: 'Vice President', city: 'Dallas', state: 'TX', lastModified: '2021-05-10' },
  // More examples with various issues
  { id: '9', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@company.co', phone: '555-234-5678', company: 'Innovation Labs', title: 'Product Manager', city: 'Austin', state: 'TX', lastModified: '2024-01-30' },
  { id: '10', firstName: 'James', lastName: 'Miller', email: 'james.miller@firm.com', phone: '555-345-6789', company: '', title: 'Consultant', city: 'Denver', state: 'CO', lastModified: '2024-02-08' }
];

const generateMockIssues = (): DataIssue[] => [
  { id: 'dup1', type: 'duplicate', severity: 'critical', field: 'email', description: 'Duplicate email addresses found', recordIds: ['1', '2'], suggestedFix: 'Merge duplicate records or update email address' },
  { id: 'miss1', type: 'missing', severity: 'critical', field: 'email', description: 'Missing email address', recordIds: ['3'], suggestedFix: 'Contact record owner to provide email address' },
  { id: 'miss2', type: 'missing', severity: 'warning', field: 'phone', description: 'Missing phone number', recordIds: ['4'], suggestedFix: 'Add phone number from other sources' },
  { id: 'miss3', type: 'missing', severity: 'warning', field: 'company', description: 'Missing company information', recordIds: ['4', '10'], suggestedFix: 'Research and add company information' },
  { id: 'inv1', type: 'invalid', severity: 'critical', field: 'email', description: 'Invalid email format', recordIds: ['5', '6'], suggestedFix: 'Correct email format (missing @ or domain)' },
  { id: 'inv2', type: 'invalid', severity: 'warning', field: 'phone', description: 'Invalid phone number format', recordIds: ['5'], suggestedFix: 'Standardize phone number format' },
  { id: 'inc1', type: 'inconsistent', severity: 'warning', field: 'name', description: 'Inconsistent name casing', recordIds: ['5', '6'], suggestedFix: 'Standardize name capitalization' },
  { id: 'inc2', type: 'inconsistent', severity: 'info', field: 'phone', description: 'Inconsistent phone format', recordIds: ['7', '8'], suggestedFix: 'Standardize phone number format across records' },
  { id: 'out1', type: 'outdated', severity: 'info', field: 'lastModified', description: 'Record not updated recently', recordIds: ['8'], suggestedFix: 'Verify and update record information' }
];

const DataCleansingPage: React.FC = () => {
  const [stage, setStage] = useState<ProcessingStage>('object-selection');
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [contacts] = useState<ContactRecord[]>(generateMockContacts());
  const [issues] = useState<DataIssue[]>(generateMockIssues());
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Processing simulation
  useEffect(() => {
    if (stage === 'processing') {
      const steps = [
        'Initializing AI engine...',
        'Analyzing data structure...',
        'Detecting duplicates...',
        'Validating field formats...',
        'Checking data consistency...',
        'Calculating quality metrics...',
        'Generating recommendations...'
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setProcessingStep(steps[currentStep]);
          setProgress((currentStep + 1) * (100 / steps.length));
          currentStep++;
        } else {
          clearInterval(interval);
          // Calculate metrics
          const totalRecords = contacts.length;
          const issuesCount = issues.reduce((acc, issue) => acc + issue.recordIds.length, 0);
          const cleanRecords = totalRecords - new Set(issues.flatMap(i => i.recordIds)).size;

          setMetrics({
            overallScore: Math.round((cleanRecords / totalRecords) * 100),
            totalRecords,
            cleanRecords,
            issuesFound: issues.length,
            duplicates: issues.filter(i => i.type === 'duplicate').length,
            missing: issues.filter(i => i.type === 'missing').length,
            invalid: issues.filter(i => i.type === 'invalid').length,
            inconsistent: issues.filter(i => i.type === 'inconsistent').length,
            outdated: issues.filter(i => i.type === 'outdated').length
          });

          setTimeout(() => setStage('results'), 500);
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [stage, contacts, issues]);

  const handleObjectSelect = (objectId: string) => {
    if (objectId === 'contacts') {
      setSelectedObject(objectId);
      setStage('processing');
      setProgress(0);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return '👥';
      case 'missing': return '❌';
      case 'invalid': return '⚠️';
      case 'inconsistent': return '🔄';
      case 'outdated': return '📅';
      default: return '❓';
    }
  };

  const renderObjectSelection = () => (
    <div className="object-selection-screen">
      <div className="selection-header">
        <h2>Select Data Object to Analyze</h2>
        <p>Choose the data object you want to perform quality analysis on</p>
      </div>

      <div className="objects-grid">
        {dataObjects.map((obj) => (
          <div
            key={obj.id}
            className={`object-card ${obj.id === 'contacts' ? 'available' : 'disabled'}`}
            onClick={() => obj.id === 'contacts' && handleObjectSelect(obj.id)}
            role="button"
            tabIndex={obj.id === 'contacts' ? 0 : -1}
            aria-label={`Analyze ${obj.name} data object`}
          >
            <div className="object-icon">{obj.icon}</div>
            <h3 className="object-name">{obj.name}</h3>
            <p className="object-description">{obj.description}</p>
            <div className="record-count">
              {obj.recordCount.toLocaleString()} records
            </div>
            {obj.id !== 'contacts' && (
              <div className="coming-soon">Coming Soon</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="processing-screen">
      <div className="processing-container">
        <div className="ai-logo">
          <div className="ai-circle">
            <span>🤖</span>
          </div>
        </div>

        <h2>AI Engine Processing</h2>
        <p>Analyzing your {selectedObject} data for quality issues...</p>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>

        <div className="processing-step">
          <span className="step-icon">⚡</span>
          {processingStep}
        </div>

        <div className="processing-stats">
          <div className="stat-item">
            <span className="stat-number">{contacts.length}</span>
            <span className="stat-label">Records Scanned</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Math.round(progress / 10)}</span>
            <span className="stat-label">Issues Detected</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!metrics) return null;

    const issuesByType = issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, DataIssue[]>);

    return (
      <div className="results-screen">
        <div className="results-header">
          <div className="header-content">
            <h2>Data Quality Analysis Complete</h2>
            <p>Comprehensive analysis of {metrics.totalRecords} contact records</p>
          </div>

          <div className="header-actions">
            <Button variant="outline" onClick={() => console.log('Export report')}>
              📊 Export Report
            </Button>
            <Button variant="primary" onClick={() => console.log('Fix all issues')}>
              🔧 Fix All Issues
            </Button>
          </div>
        </div>

        {/* Quality Score */}
        <div className="quality-score-section">
          <div className="score-card">
            <div className="score-circle">
              <div className="score-value">{metrics.overallScore}%</div>
              <div className="score-label">Quality Score</div>
            </div>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span className="item-value">{metrics.cleanRecords}</span>
                <span className="item-label">Clean Records</span>
              </div>
              <div className="breakdown-item">
                <span className="item-value">{metrics.issuesFound}</span>
                <span className="item-label">Issues Found</span>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="issues-summary">
          <h3>Issues by Category</h3>
          <div className="summary-grid">
            {Object.entries(issuesByType).map(([type, typeIssues]) => (
              <div key={type} className="summary-card">
                <div className="summary-icon">{getIssueIcon(type)}</div>
                <div className="summary-content">
                  <div className="summary-count">{typeIssues.length}</div>
                  <div className="summary-type">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Issues */}
        <div className="detailed-issues">
          <h3>Detailed Issue Breakdown</h3>
          {Object.entries(issuesByType).map(([type, typeIssues]) => (
            <div key={type} className="issue-category">
              <div
                className="category-header"
                onClick={() => toggleCategory(type)}
                role="button"
                tabIndex={0}
              >
                <span className="category-icon">{getIssueIcon(type)}</span>
                <span className="category-name">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Issues
                </span>
                <span className="category-count">({typeIssues.length})</span>
                <span className="expand-icon">
                  {expandedCategories.has(type) ? '▼' : '▶'}
                </span>
              </div>

              {expandedCategories.has(type) && (
                <div className="category-content">
                  {typeIssues.map((issue) => (
                    <div key={issue.id} className="issue-item">
                      <div className="issue-header">
                        <span
                          className="severity-indicator"
                          style={{ backgroundColor: getSeverityColor(issue.severity) }}
                        ></span>
                        <span className="issue-field">{issue.field}</span>
                        <span className="issue-count">{issue.recordIds.length} record(s)</span>
                      </div>
                      <div className="issue-description">{issue.description}</div>
                      <div className="issue-suggestion">
                        <strong>Suggested Fix:</strong> {issue.suggestedFix}
                      </div>
                      <div className="issue-actions">
                        <Button size="small" variant="outline">
                          View Records
                        </Button>
                        <Button size="small" variant="primary">
                          Apply Fix
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div className="action-panel">
          <div className="panel-content">
            <h3>Next Steps</h3>
            <p>Review the identified issues and apply fixes to improve your data quality.</p>
            <div className="panel-actions">
              <Button variant="outline" onClick={() => setStage('object-selection')}>
                🔄 Analyze Another Object
              </Button>
              <Button variant="success" onClick={() => console.log('Start cleanup')}>
                🚀 Start Data Cleanup
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="scrollable-content">
        <div className="data-cleansing-page">
          <div className="page-header">
            <h1>🧹 Data Quality Manager</h1>
            <p>AI-powered data cleansing and quality analysis</p>
          </div>

          {stage === 'object-selection' && renderObjectSelection()}
          {stage === 'processing' && renderProcessing()}
          {stage === 'results' && renderResults()}
        </div>
      </main>

      <style jsx>{`
        .data-cleansing-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        /* Object Selection Styles */
        .object-selection-screen {
          animation: fadeIn 0.5s ease;
        }

        .selection-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .selection-header h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .selection-header p {
          color: var(--text-secondary);
        }

        .objects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .object-card {
          background: var(--bg-card);
          border: 2px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .object-card.available:hover {
          transform: translateY(-4px);
          border-color: var(--bg-button);
          box-shadow: var(--shadow-lg);
        }

        .object-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .object-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .object-name {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .object-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .record-count {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1.1rem;
        }

        .coming-soon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-warning);
          color: var(--text-inverse);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Processing Styles */
        .processing-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          animation: fadeIn 0.5s ease;
        }

        .processing-container {
          text-align: center;
          max-width: 500px;
        }

        .ai-logo {
          margin-bottom: 2rem;
        }

        .ai-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--bg-button), var(--bg-success));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          font-size: 3rem;
          animation: pulse 2s infinite;
        }

        .processing-container h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .processing-container p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .progress-container {
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--bg-button), var(--bg-success));
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1.2rem;
        }

        .processing-step {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .step-icon {
          animation: spin 1s linear infinite;
        }

        .processing-stats {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* Results Styles */
        .results-screen {
          animation: fadeIn 0.5s ease;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .header-content h2 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .quality-score-section {
          margin-bottom: 3rem;
        }

        .score-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 3rem;
          box-shadow: var(--shadow-md);
        }

        .score-circle {
          text-align: center;
          min-width: 120px;
        }

        .score-value {
          font-size: 3rem;
          font-weight: bold;
          color: var(--bg-success);
          display: block;
        }

        .score-label {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .score-breakdown {
          display: flex;
          gap: 2rem;
          flex: 1;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .item-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .item-label {
          color: var(--text-secondary);
        }

        .issues-summary {
          margin-bottom: 3rem;
        }

        .issues-summary h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .summary-card {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .summary-icon {
          font-size: 2rem;
        }

        .summary-count {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .summary-type {
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .detailed-issues {
          margin-bottom: 3rem;
        }

        .detailed-issues h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .issue-category {
          background: var(--bg-card);
          border-radius: 12px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .category-header {
          padding: 1rem 1.5rem;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-header:hover {
          background: var(--bg-accent);
        }

        .category-name {
          color: var(--text-primary);
          font-weight: 600;
          flex: 1;
        }

        .category-count {
          color: var(--text-secondary);
        }

        .expand-icon {
          color: var(--text-secondary);
        }

        .category-content {
          padding: 1rem;
        }

        .issue-item {
          background: var(--bg-accent);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .issue-item:last-child {
          margin-bottom: 0;
        }

        .issue-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .severity-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .issue-field {
          color: var(--text-primary);
          font-weight: 600;
        }

        .issue-count {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .issue-description {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .issue-suggestion {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .issue-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-panel {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .panel-content h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .panel-content p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .panel-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .data-cleansing-page {
            padding: 1rem;
          }

          .objects-grid {
            grid-template-columns: 1fr;
          }

          .results-header {
            flex-direction: column;
            gap: 1rem;
          }

          .score-card {
            flex-direction: column;
            gap: 2rem;
          }

          .score-breakdown {
            justify-content: center;
          }

          .header-actions,
          .panel-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default DataCleansingPage;