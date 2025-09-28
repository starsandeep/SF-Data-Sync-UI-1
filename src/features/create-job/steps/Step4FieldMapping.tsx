// Step 4: Field Mapping Component
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import { FieldMapping } from '../types';

interface Step4FieldMappingProps {
  fieldMappings: FieldMapping;
  selectedFields: string[];
  syncAllFields: boolean;
  onUpdateMappings: (mappings: FieldMapping, transformations: Record<string, any>, selectedFields: string[], syncAllFields: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

interface MappingRow {
  sourceField: string;
  sourceLabel: string;
  targetField: string;
  isEditing: boolean;
}

// Available Salesforce fields for mapping
const SALESFORCE_FIELDS = [
  { value: 'AccountId__c', label: 'AccountId__c' },
  { value: 'Name', label: 'Name' },
  { value: 'CreatedById', label: 'CreatedById' },
  { value: 'Dept__c', label: 'Dept__c' },
  { value: 'Desc__c', label: 'Desc__c' },
  { value: 'First_Name__c', label: 'First_Name__c' },
  { value: 'Last_Name__c', label: 'Last_Name__c' },
  { value: 'MailCity__c', label: 'MailCity__c' },
  { value: 'MailingCountry__c', label: 'MailingCountry__c' },
  { value: 'MailingState__c', label: 'MailingState__c' },
  { value: 'OwnerId', label: 'OwnerId' },
  { value: 'Phone__c', label: 'Phone__c' },
  { value: 'Title__c', label: 'Title__c' },
  { value: 'LastModifiedById', label: 'LastModifiedById' },
  { value: 'extid__c', label: 'extid__c' },
  { value: '', label: '-- (Unmapped)' }
];

// Default field mappings
const DEFAULT_MAPPINGS: MappingRow[] = [
  { sourceField: 'AccountId', sourceLabel: 'AccountId', targetField: 'AccountId__c', isEditing: false },
  { sourceField: 'Name', sourceLabel: 'Name', targetField: 'Name', isEditing: false },
  { sourceField: 'CreatedById', sourceLabel: 'CreatedById', targetField: 'CreatedById', isEditing: false },
  { sourceField: 'Department', sourceLabel: 'Department', targetField: 'Dept__c', isEditing: false },
  { sourceField: 'Description', sourceLabel: 'Description', targetField: 'Desc__c', isEditing: false },
  { sourceField: 'FirstName', sourceLabel: 'FirstName', targetField: 'First_Name__c', isEditing: false },
  { sourceField: 'LastName', sourceLabel: 'LastName', targetField: 'Last_Name__c', isEditing: false },
  { sourceField: 'MailingCity', sourceLabel: 'MailingCity', targetField: 'MailCity__c', isEditing: false },
  { sourceField: 'MailingCountry', sourceLabel: 'MailingCountry', targetField: 'MailingCountry__c', isEditing: false },
  { sourceField: 'MailingState', sourceLabel: 'MailingState', targetField: 'MailingState__c', isEditing: false },
  { sourceField: 'OwnerId', sourceLabel: 'OwnerId', targetField: 'OwnerId', isEditing: false },
  { sourceField: 'Phone', sourceLabel: 'Phone', targetField: 'Phone__c', isEditing: false },
  { sourceField: 'Title', sourceLabel: 'Title', targetField: 'Title__c', isEditing: false },
  { sourceField: 'LastModifiedById', sourceLabel: 'LastModifiedById', targetField: 'LastModifiedById', isEditing: false },
  { sourceField: 'Id', sourceLabel: 'Id', targetField: 'extid__c', isEditing: false }
];

export const Step4FieldMapping: React.FC<Step4FieldMappingProps> = ({
  fieldMappings,
  selectedFields,
  syncAllFields,
  onUpdateMappings,
  onNext,
  onPrevious,
  isLoading
}) => {
  const [showLoader, setShowLoader] = useState(true);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('Initializing field analysis...');

  const [mappingRows, setMappingRows] = useState<MappingRow[]>(() => {
    // Initialize with default mappings or existing mappings
    return DEFAULT_MAPPINGS.map(row => ({
      ...row,
      targetField: fieldMappings[row.sourceField] || row.targetField
    }));
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempTargetField, setTempTargetField] = useState<string>('');

  // Loader effect with progress animation
  useEffect(() => {
    if (!showLoader) return;

    const steps = [
      'Initializing field analysis...',
      'Analyzing source data structure...',
      'Mapping field relationships...',
      'Optimizing data transformations...',
      'Finalizing field mappings...'
    ];

    let currentStep = 0;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      // Update processing step every 20% progress
      if (currentProgress % 20 === 0 && currentStep < steps.length - 1) {
        currentStep++;
        setProcessingStep(steps[currentStep]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowLoader(false);
        }, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showLoader]);

  // Check for duplicate mappings
  const duplicateTargetFields = useMemo(() => {
    const targetFields = mappingRows
      .map(row => row.targetField)
      .filter(field => field && field !== '');

    const duplicates = targetFields.filter((field, index) =>
      targetFields.indexOf(field) !== index
    );

    return new Set(duplicates);
  }, [mappingRows]);

  const handleEditStart = useCallback((sourceField: string, currentTargetField: string) => {
    setEditingField(sourceField);
    setTempTargetField(currentTargetField);
    setMappingRows(prev =>
      prev.map(row =>
        row.sourceField === sourceField
          ? { ...row, isEditing: true }
          : row
      )
    );
  }, []);

  const handleEditSave = useCallback((sourceField: string) => {
    setMappingRows(prev =>
      prev.map(row =>
        row.sourceField === sourceField
          ? { ...row, targetField: tempTargetField, isEditing: false }
          : row
      )
    );
    setEditingField(null);
    setTempTargetField('');
  }, [tempTargetField]);

  const handleEditCancel = useCallback((sourceField: string) => {
    setMappingRows(prev =>
      prev.map(row =>
        row.sourceField === sourceField
          ? { ...row, isEditing: false }
          : row
      )
    );
    setEditingField(null);
    setTempTargetField('');
  }, []);

  const handleDelete = useCallback((sourceField: string) => {
    setMappingRows(prev => prev.filter(row => row.sourceField !== sourceField));
  }, []);

  const handleSaveMappings = useCallback(() => {
    const newMappings: FieldMapping = {};
    const newSelectedFields: string[] = [];

    mappingRows.forEach(row => {
      if (row.targetField && row.targetField !== '') {
        newMappings[row.sourceField] = row.targetField;
        newSelectedFields.push(row.sourceField);
      }
    });

    // For now, no transformations are configured in this step
    const transformations = {};

    onUpdateMappings(newMappings, transformations, newSelectedFields, syncAllFields);
  }, [mappingRows, syncAllFields, onUpdateMappings]);

  const handleNext = useCallback(() => {
    handleSaveMappings();
    onNext();
  }, [handleSaveMappings, onNext]);

  const hasDuplicates = duplicateTargetFields.size > 0;
  const canProceed = !hasDuplicates && mappingRows.some(row => row.targetField && row.targetField !== '');

  if (showLoader) {
    return (
      <div className="processing-screen">
        <div className="processing-container">
          <div className="ai-logo">
            <div className="ai-circle">
              🧠
            </div>
          </div>

          <h2>AI-Powered Analysis in Progress</h2>
          <p>Our advanced algorithms are analyzing your data quality...</p>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">{Math.round(progress)}% Complete</div>
          </div>

          <div className="processing-step">
            <span className="step-icon">⚙️</span>
            <span>{processingStep}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h4 className="step-title">Field Mapping</h4>
        <p className="step-description">
          This is AI-driven field mapping. It automatically maps fields based on names and provide autosuggestions.
          Configure how source fields map to target Salesforce fields.
          Some default mappings are pre-configured to get you started.
        </p>
      </div>

      <div className="info-box">
        <strong>Required Editions:</strong> Available in: All Account Engagement Editions
      </div>

      <div className="field-mapping-table">
        <div className="table-header">
          <div className="column-header">Source Field</div>
          <div className="column-header">Target Field (Salesforce)</div>
          <div className="column-header">Actions</div>
        </div>

        {mappingRows.map((row) => {
          const isDuplicate = duplicateTargetFields.has(row.targetField) && row.targetField !== '';

          return (
            <div
              key={row.sourceField}
              className={`mapping-row ${row.isEditing ? 'editing' : ''} ${isDuplicate ? 'duplicate' : ''}`}
            >
              <div className="source-field">
                <div className="field-label">{row.sourceLabel}</div>
              </div>

              <div className="target-field">
                {row.isEditing ? (
                  <div className="edit-container">
                    <select
                      value={tempTargetField}
                      onChange={(e) => setTempTargetField(e.target.value)}
                      className={`field-select ${isDuplicate ? 'error' : ''}`}
                      autoFocus
                    >
                      {SALESFORCE_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    {isDuplicate && (
                      <div className="error-message">This field is already mapped</div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`field-display ${!row.targetField ? 'unmapped' : ''} ${isDuplicate ? 'duplicate' : ''}`}
                    onClick={() => handleEditStart(row.sourceField, row.targetField)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEditStart(row.sourceField, row.targetField);
                      }
                    }}
                  >
                    {row.targetField || 'Click to map'}
                    {isDuplicate && <span className="duplicate-indicator"> (Duplicate)</span>}
                  </div>
                )}
              </div>

              <div className="actions">
                {row.isEditing ? (
                  <div className="edit-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleEditSave(row.sourceField)}
                      disabled={isDuplicate}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditCancel(row.sourceField)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="row-actions edit-actions">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditStart(row.sourceField, row.targetField)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(row.sourceField)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasDuplicates && (
        <div className="error-message" role="alert">
          <strong>Duplicate mappings detected:</strong> Multiple source fields are mapped to the same target field.
          Please resolve duplicates before proceeding.
        </div>
      )}

      {!hasDuplicates && mappingRows.every(row => !row.targetField || row.targetField === '') && (
        <div className="warning-message" role="alert">
          <strong>No mappings configured:</strong> At least one field mapping is required to proceed.
        </div>
      )}

      <div className="auto-save-info">
        ℹ️ Changes are automatically saved when you proceed to the next step
      </div>

      <div className="step-actions">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
        >
          Previous
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          loading={isLoading}
        >
          Continue to Test & Schedule
        </Button>
      </div>
    </div>
  );
};