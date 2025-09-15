// Step 4: Field Mapping Component
import React, { useState, useCallback, useMemo } from 'react';
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

// Available Salesforce Opportunity fields for mapping
const SALESFORCE_OPPORTUNITY_FIELDS = [
  { value: 'CloseDate', label: 'CloseDate' },
  { value: 'CreatedDate', label: 'CreatedDate' },
  { value: 'IsDeleted', label: 'IsDeleted' },
  { value: 'Name', label: 'Name' },
  { value: 'Probability', label: 'Probability' },
  { value: 'StageName', label: 'StageName' },
  { value: 'Type', label: 'Type' },
  { value: 'LastModifiedDate', label: 'LastModifiedDate' },
  { value: 'Amount', label: 'Amount' },
  { value: '', label: '-- (Unmapped)' }
];

// Default field mappings for Account Engagement to Salesforce Opportunity
const DEFAULT_MAPPINGS: MappingRow[] = [
  { sourceField: 'Close Date', sourceLabel: 'Close Date', targetField: 'CloseDate', isEditing: false },
  { sourceField: 'Created', sourceLabel: 'Created', targetField: 'CreatedDate', isEditing: false },
  { sourceField: 'Deleted', sourceLabel: 'Deleted', targetField: 'IsDeleted', isEditing: false },
  { sourceField: 'Opportunity Name', sourceLabel: 'Opportunity Name', targetField: 'Name', isEditing: false },
  { sourceField: 'Probability', sourceLabel: 'Probability', targetField: 'Probability', isEditing: false },
  { sourceField: 'Stage', sourceLabel: 'Stage', targetField: 'StageName', isEditing: false },
  { sourceField: 'Status', sourceLabel: 'Status', targetField: '', isEditing: false },
  { sourceField: 'Type', sourceLabel: 'Type', targetField: 'Type', isEditing: false },
  { sourceField: 'Updated At', sourceLabel: 'Updated At', targetField: 'LastModifiedDate', isEditing: false },
  { sourceField: 'Value', sourceLabel: 'Value', targetField: 'Amount', isEditing: false }
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
  const [mappingRows, setMappingRows] = useState<MappingRow[]>(() => {
    // Initialize with default mappings or existing mappings
    return DEFAULT_MAPPINGS.map(row => ({
      ...row,
      targetField: fieldMappings[row.sourceField] || row.targetField
    }));
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempTargetField, setTempTargetField] = useState<string>('');

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

  return (
    <div className="step-container">
      <div className="step-header">
        <h4 className="step-title">Opportunity Field Mapping</h4>
        <p className="step-description">
          Configure how Account Engagement fields map to Salesforce Opportunity fields.
          Some default mappings are pre-configured to get you started.
        </p>
      </div>

      <div className="info-box">
        <strong>Required Editions:</strong> Available in: All Account Engagement Editions
      </div>

      <div className="field-mapping-table">
        <div className="table-header">
          <div className="column-header">Source Field (Account Engagement)</div>
          <div className="column-header">Target Field (Salesforce Opportunity)</div>
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
                      {SALESFORCE_OPPORTUNITY_FIELDS.map((field) => (
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
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleEditStart(row.sourceField, row.targetField)}
                  >
                    Edit
                  </Button>
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