import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import '../App.css';

interface DataQualityMetrics {
  totalRecords: number;
  duplicateRecords: number;
  missingFields: number;
  qualityScore: number;
}

interface DataIssue {
  id: string;
  column: string;
  type: 'missing' | 'inconsistent' | 'outlier';
  value: string | null;
  count?: number;
  suggestedFix?: string;
}

type WorkflowStage = 'audit' | 'cleansing' | 'validation';
type CleansingTab = 'missing' | 'inconsistencies' | 'outliers';
type ImputationMethod = 'remove' | 'mean' | 'median' | 'mode' | 'custom';
type OutlierAction = 'keep' | 'remove' | 'median';

const mockColumns = ['customer_name', 'email', 'phone', 'country', 'revenue', 'created_date'];

const mockDataQuality: DataQualityMetrics = {
  totalRecords: 10000,
  duplicateRecords: 250,
  missingFields: 180,
  qualityScore: 85
};

const mockIssues: Record<string, DataIssue[]> = {
  missing: [
    { id: '1', column: 'email', type: 'missing', value: null, count: 45 },
    { id: '2', column: 'phone', type: 'missing', value: null, count: 32 },
    { id: '3', column: 'revenue', type: 'missing', value: null, count: 28 }
  ],
  inconsistencies: [
    { id: '4', column: 'country', type: 'inconsistent', value: 'US', count: 120, suggestedFix: 'United States' },
    { id: '5', column: 'country', type: 'inconsistent', value: 'U.S.A.', count: 85, suggestedFix: 'United States' },
    { id: '6', column: 'email', type: 'inconsistent', value: 'UPPERCASE@DOMAIN.COM', count: 67, suggestedFix: 'lowercase@domain.com' }
  ],
  outliers: [
    { id: '7', column: 'revenue', type: 'outlier', value: '50000000', count: 1 },
    { id: '8', column: 'revenue', type: 'outlier', value: '-5000', count: 3 },
    { id: '9', column: 'phone', type: 'outlier', value: '1234', count: 2 }
  ]
};

const DataCleansingPage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('audit');
  const [activeTab, setActiveTab] = useState<CleansingTab>('missing');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [imputationMethod, setImputationMethod] = useState<ImputationMethod>('mean');
  const [customValue, setCustomValue] = useState<string>('');
  const [standardizationValue, setStandardizationValue] = useState<string>('');
  const [outlierActions, setOutlierActions] = useState<Record<string, OutlierAction>>({});
  const [qualityImprovement, setQualityImprovement] = useState<{ before: number; after: number }>({ before: 85, after: 92 });

  const handleVerifyField = () => {
    if (!selectedColumn) {
      alert('Please select a column first');
      return;
    }
    // Simulate field verification - in real implementation, this would fetch issues for the selected field
    console.log(`Verifying field: ${selectedColumn}`);
  };

  const handleApplyFix = () => {
    console.log(`Applying ${imputationMethod} fix to ${selectedColumn}`);
    // Simulate applying fixes
  };

  const handleApplyStandardization = () => {
    if (selectedIssues.length === 0) {
      alert('Please select issues to standardize');
      return;
    }
    console.log(`Standardizing ${selectedIssues.length} issues to: ${standardizationValue}`);
  };

  const handleApplyOutlierTreatment = () => {
    console.log('Applying outlier treatment:', outlierActions);
  };

  const renderAuditStage = () => (
    <div className="cleansing-stage">
      <div className="audit-dashboard">
        <div className="quality-score-card">
          <h2>Data Quality Score</h2>
          <div className="score-circle">
            <span className="score-number">{mockDataQuality.qualityScore}</span>
            <span className="score-total">/100</span>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>Total Records</h3>
              <p className="metric-number">{mockDataQuality.totalRecords.toLocaleString()}</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <h3>Duplicate Records</h3>
              <p className="metric-number">{mockDataQuality.duplicateRecords}</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">❌</div>
            <div className="metric-content">
              <h3>Missing Fields</h3>
              <p className="metric-number">{mockDataQuality.missingFields}</p>
            </div>
          </div>
        </div>

        <div className="audit-actions">
          <Button
            variant="primary"
            size="large"
            onClick={() => setCurrentStage('cleansing')}
          >
            Start Cleansing
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCleansingStage = () => (
    <div className="cleansing-stage">
      <div className="cleansing-header">
        <h2>Data Cleansing Workflow</h2>
        <div className="field-selection">
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="field-dropdown"
          >
            <option value="">Select Column/Field</option>
            {mockColumns.map(column => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={handleVerifyField}
            disabled={!selectedColumn}
          >
            Verify Selected Field
          </Button>
        </div>
      </div>

      <div className="cleansing-tabs">
        <button
          className={`tab-button ${activeTab === 'missing' ? 'active' : ''}`}
          onClick={() => setActiveTab('missing')}
        >
          Missing Values
        </button>
        <button
          className={`tab-button ${activeTab === 'inconsistencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('inconsistencies')}
        >
          Inconsistencies
        </button>
        <button
          className={`tab-button ${activeTab === 'outliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('outliers')}
        >
          Outliers
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'missing' && (
          <div className="missing-values-tab">
            <h3>Missing Values in Column: {selectedColumn || 'None selected'}</h3>
            {selectedColumn && (
              <>
                <div className="issues-list">
                  {mockIssues.missing
                    .filter(issue => issue.column === selectedColumn)
                    .map(issue => (
                    <div key={issue.id} className="issue-item">
                      <span>Missing values found: {issue.count} records</span>
                    </div>
                  ))}
                </div>
                <div className="action-controls">
                  <select
                    value={imputationMethod}
                    onChange={(e) => setImputationMethod(e.target.value as ImputationMethod)}
                  >
                    <option value="remove">Remove Row</option>
                    <option value="mean">Fill with Mean</option>
                    <option value="median">Fill with Median</option>
                    <option value="mode">Fill with Mode</option>
                    <option value="custom">Fill with Custom Value</option>
                  </select>
                  {imputationMethod === 'custom' && (
                    <input
                      type="text"
                      placeholder="Enter custom value"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                    />
                  )}
                  <Button variant="primary" onClick={handleApplyFix}>
                    Apply Fix
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'inconsistencies' && (
          <div className="inconsistencies-tab">
            <h3>Inconsistent Values in Column: {selectedColumn || 'None selected'}</h3>
            {selectedColumn && (
              <>
                <div className="issues-table">
                  <table className="inconsistencies-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Inconsistent Value</th>
                        <th>Count</th>
                        <th>Suggested Fix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockIssues.inconsistencies
                        .filter(issue => issue.column === selectedColumn)
                        .map(issue => (
                        <tr key={issue.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIssues.includes(issue.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIssues([...selectedIssues, issue.id]);
                                } else {
                                  setSelectedIssues(selectedIssues.filter(id => id !== issue.id));
                                }
                              }}
                            />
                          </td>
                          <td>{issue.value}</td>
                          <td>{issue.count}</td>
                          <td>{issue.suggestedFix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="action-controls">
                  <input
                    type="text"
                    placeholder="Standardized value"
                    value={standardizationValue}
                    onChange={(e) => setStandardizationValue(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    onClick={handleApplyStandardization}
                    disabled={selectedIssues.length === 0}
                  >
                    Apply Standardization
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'outliers' && (
          <div className="outliers-tab">
            <h3>Outliers in Column: {selectedColumn || 'None selected'}</h3>
            {selectedColumn && (
              <>
                <div className="outlier-visualization">
                  <div className="mini-chart">
                    <span>📊 Outlier Distribution Chart</span>
                    <div className="chart-placeholder">
                      [Chart visualization would go here]
                    </div>
                  </div>
                </div>
                <div className="outliers-list">
                  {mockIssues.outliers
                    .filter(issue => issue.column === selectedColumn)
                    .map(issue => (
                    <div key={issue.id} className="outlier-item">
                      <span>Value: {issue.value} (Count: {issue.count})</span>
                      <select
                        value={outlierActions[issue.id] || 'keep'}
                        onChange={(e) => setOutlierActions({
                          ...outlierActions,
                          [issue.id]: e.target.value as OutlierAction
                        })}
                      >
                        <option value="keep">Keep</option>
                        <option value="remove">Remove</option>
                        <option value="median">Replace with Median</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="action-controls">
                  <Button variant="primary" onClick={handleApplyOutlierTreatment}>
                    Apply Outlier Treatment
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="stage-navigation">
        <Button
          variant="outline"
          onClick={() => setCurrentStage('audit')}
        >
          ← Back to Audit
        </Button>
        <Button
          variant="primary"
          onClick={() => setCurrentStage('validation')}
        >
          Continue to Validation →
        </Button>
      </div>
    </div>
  );

  const renderValidationStage = () => (
    <div className="cleansing-stage">
      <div className="validation-summary">
        <h2>Validation & Documentation</h2>

        <div className="improvement-summary">
          <h3>Quality Improvement</h3>
          <div className="before-after">
            <div className="quality-comparison">
              <div className="before-score">
                <span className="label">Before</span>
                <span className="score">{qualityImprovement.before}/100</span>
              </div>
              <div className="arrow">→</div>
              <div className="after-score">
                <span className="label">After</span>
                <span className="score">{qualityImprovement.after}/100</span>
              </div>
            </div>
            <div className="improvement-percentage">
              <span className="improvement">
                +{qualityImprovement.after - qualityImprovement.before} points improvement
              </span>
            </div>
          </div>
        </div>

        <div className="cleansing-summary">
          <h3>Cleansing Summary</h3>
          <ul>
            <li>Fixed {mockIssues.missing.length} missing value issues</li>
            <li>Standardized {mockIssues.inconsistencies.length} inconsistent values</li>
            <li>Processed {mockIssues.outliers.length} outlier records</li>
            <li>Total records improved: {mockIssues.missing.length + mockIssues.inconsistencies.length + mockIssues.outliers.length}</li>
          </ul>
        </div>

        <div className="documentation-actions">
          <Button
            variant="primary"
            size="large"
            onClick={() => console.log('Downloading cleansing log...')}
          >
            📥 Download Cleansing Log
          </Button>
          <Button
            variant="outline"
            size="large"
            onClick={() => console.log('Generating report...')}
          >
            📊 Generate Report
          </Button>
        </div>

        <div className="stage-navigation">
          <Button
            variant="outline"
            onClick={() => setCurrentStage('cleansing')}
          >
            ← Back to Cleansing
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setCurrentStage('audit');
              // Reset state for new cleansing workflow
              setSelectedColumn('');
              setSelectedIssues([]);
              setOutlierActions({});
            }}
          >
            Start New Cleansing
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStageIndicator = () => (
    <div className="stage-indicator">
      <div className={`stage-step ${currentStage === 'audit' ? 'active' : currentStage === 'cleansing' || currentStage === 'validation' ? 'completed' : ''}`}>
        <span className="step-number">1</span>
        <span className="step-label">Data Audit</span>
      </div>
      <div className={`stage-step ${currentStage === 'cleansing' ? 'active' : currentStage === 'validation' ? 'completed' : ''}`}>
        <span className="step-number">2</span>
        <span className="step-label">Cleansing Workflow</span>
      </div>
      <div className={`stage-step ${currentStage === 'validation' ? 'active' : ''}`}>
        <span className="step-number">3</span>
        <span className="step-label">Validation & Documentation</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Header />
      <main className="scrollable-content">
        <div className="data-cleansing-container">
          <div className="cleansing-header-section">
            <h1>🧹 Data Cleansing Workflow</h1>
            {renderStageIndicator()}
          </div>

          {currentStage === 'audit' && renderAuditStage()}
          {currentStage === 'cleansing' && renderCleansingStage()}
          {currentStage === 'validation' && renderValidationStage()}
        </div>
      </main>

      <style jsx>{`
        .data-cleansing-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .cleansing-header-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .cleansing-header-section h1 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .stage-indicator {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .stage-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .stage-step.active,
        .stage-step.completed {
          opacity: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: var(--text-secondary);
        }

        .stage-step.active .step-number {
          background: var(--bg-button);
          color: var(--text-inverse);
        }

        .stage-step.completed .step-number {
          background: var(--bg-success);
          color: var(--text-inverse);
        }

        .step-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .cleansing-stage {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: var(--shadow-md);
        }

        .audit-dashboard {
          text-align: center;
        }

        .quality-score-card {
          margin-bottom: 3rem;
        }

        .quality-score-card h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .score-circle {
          display: inline-flex;
          align-items: baseline;
          gap: 0.5rem;
          font-size: 3rem;
          font-weight: bold;
          color: var(--bg-success);
        }

        .score-number {
          font-size: 4rem;
        }

        .score-total {
          font-size: 2rem;
          color: var(--text-secondary);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .metric-card {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-icon {
          font-size: 2rem;
        }

        .metric-content h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .metric-number {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
          color: var(--text-primary);
        }

        .cleansing-header {
          margin-bottom: 2rem;
        }

        .cleansing-header h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .field-selection {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .field-dropdown {
          padding: 0.75rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          background: var(--bg-input);
          color: var(--text-primary);
          min-width: 200px;
        }

        .cleansing-tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .tab-button {
          padding: 1rem 2rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          color: var(--text-primary);
        }

        .tab-button.active {
          color: var(--bg-button);
          border-bottom-color: var(--bg-button);
        }

        .tab-content {
          min-height: 400px;
          padding: 1rem 0;
        }

        .issues-list,
        .outliers-list {
          margin: 1rem 0;
        }

        .issue-item,
        .outlier-item {
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .inconsistencies-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .inconsistencies-table th,
        .inconsistencies-table td {
          padding: 0.75rem;
          border: 1px solid var(--border-primary);
          text-align: left;
        }

        .inconsistencies-table th {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .action-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .action-controls input,
        .action-controls select {
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          background: var(--bg-input);
          color: var(--text-primary);
        }

        .stage-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
        }

        .outlier-visualization {
          margin: 1rem 0;
          text-align: center;
        }

        .mini-chart {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: 8px;
        }

        .chart-placeholder {
          margin-top: 1rem;
          color: var(--text-secondary);
        }

        .validation-summary h2 {
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 2rem;
        }

        .improvement-summary {
          text-align: center;
          margin-bottom: 3rem;
        }

        .improvement-summary h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .quality-comparison {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .before-score,
        .after-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .before-score .score {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-warning);
        }

        .after-score .score {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-success);
        }

        .arrow {
          font-size: 2rem;
          color: var(--text-secondary);
        }

        .improvement-percentage {
          color: var(--text-success);
          font-weight: bold;
        }

        .cleansing-summary {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 3rem;
        }

        .cleansing-summary h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .cleansing-summary ul {
          list-style: none;
          padding: 0;
        }

        .cleansing-summary li {
          padding: 0.5rem 0;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-secondary);
        }

        .cleansing-summary li:last-child {
          border-bottom: none;
        }

        .documentation-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .data-cleansing-container {
            padding: 1rem;
          }

          .stage-indicator {
            flex-direction: column;
            gap: 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .quality-comparison {
            flex-direction: column;
            gap: 1rem;
          }

          .field-selection,
          .action-controls,
          .documentation-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .stage-navigation {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DataCleansingPage;