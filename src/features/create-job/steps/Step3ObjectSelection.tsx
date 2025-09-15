// Step 3: Salesforce Object Selection Component
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Modal } from '../../../components/common/Modal';
import { SalesforceObject, SalesforceField, ChildObject } from '../types';
import { mockSalesforceAPI, MOCK_OBJECTS } from '../api/mockAPI';

interface Step3ObjectSelectionProps {
  selectedObject: string;
  onSelectObject: (objectName: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
}

export const Step3ObjectSelection: React.FC<Step3ObjectSelectionProps> = ({
  selectedObject,
  onSelectObject,
  onNext,
  onPrevious,
  isLoading
}) => {
  const [objects, setObjects] = useState<SalesforceObject[]>([]);
  const [customObjects, setCustomObjects] = useState<SalesforceObject[]>([]);
  const [loadingObjects, setLoadingObjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjectDetails, setSelectedObjectDetails] = useState<SalesforceObject | null>(null);
  const [objectFields, setObjectFields] = useState<SalesforceField[]>([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddObjectModal, setShowAddObjectModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showAddChildObjectModal, setShowAddChildObjectModal] = useState(false);

  // Form states
  const [newObjectForm, setNewObjectForm] = useState({
    label: '',
    apiName: '',
    description: '',
    parentObject: ''
  });

  const [newFieldForm, setNewFieldForm] = useState({
    label: '',
    apiName: '',
    dataType: 'string',
    description: ''
  });

  const [newChildObjectForm, setNewChildObjectForm] = useState({
    label: '',
    apiName: '',
    relationshipType: 'Lookup' as 'Lookup' | 'Master-Detail' | 'Hierarchical',
    description: ''
  });

  // Load Salesforce objects on mount
  useEffect(() => {
    const loadObjects = async () => {
      setLoadingObjects(true);
      setError(null);

      try {
        const response = await mockSalesforceAPI.listObjects({
          connectionId: 'source'
        });

        if (response.success) {
          setObjects(response.objects);
        } else {
          setError(response.error || 'Failed to load Salesforce objects');
          setObjects(MOCK_OBJECTS);
        }
      } catch (err) {
        console.error('Error loading objects:', err);
        setError('Network error occurred while loading objects');
        setObjects(MOCK_OBJECTS);
      } finally {
        setLoadingObjects(false);
      }
    };

    loadObjects();
  }, []);

  // Load object fields when an object is selected
  useEffect(() => {
    const loadObjectFields = async () => {
      if (!selectedObjectDetails) {
        setObjectFields([]);
        return;
      }

      setLoadingFields(true);
      try {
        const response = await mockSalesforceAPI.getFields({
          connectionId: 'source',
          objectName: selectedObjectDetails.name
        });

        if (response.success) {
          setObjectFields(response.fields);
        } else {
          setObjectFields([]);
          console.error('Failed to load object fields:', response.error);
        }
      } catch (err) {
        console.error('Error loading object fields:', err);
        setObjectFields([]);
      } finally {
        setLoadingFields(false);
      }
    };

    loadObjectFields();
  }, [selectedObjectDetails]);

  // Set selected object details when selection changes
  useEffect(() => {
    if (selectedObject) {
      const allObjects = [...objects, ...customObjects];
      const objectDetails = allObjects.find(obj => obj.name === selectedObject);
      setSelectedObjectDetails(objectDetails || null);
    } else {
      setSelectedObjectDetails(null);
    }
  }, [selectedObject, objects, customObjects]);

  // Filter objects based on search term
  const filteredObjects = useMemo(() => {
    const allObjects = [...objects, ...customObjects];
    if (!searchTerm.trim()) {
      return allObjects;
    }

    const term = searchTerm.toLowerCase();
    return allObjects.filter(obj =>
      obj.name.toLowerCase().includes(term) ||
      obj.label.toLowerCase().includes(term) ||
      obj.description?.toLowerCase().includes(term)
    );
  }, [objects, customObjects, searchTerm]);

  // Separate standard and custom objects for display
  const standardObjects = filteredObjects.filter(obj => !obj.isCustom);
  const customObjectsFiltered = filteredObjects.filter(obj => obj.isCustom);

  // Handle custom object creation
  const handleAddCustomObject = useCallback(() => {
    if (!newObjectForm.label || !newObjectForm.apiName) {
      return;
    }

    const newObject: SalesforceObject = {
      name: newObjectForm.apiName,
      label: newObjectForm.label,
      apiName: newObjectForm.apiName,
      fieldCount: 0,
      description: newObjectForm.description,
      isCustom: true,
      parentObject: newObjectForm.parentObject || undefined,
      childObjects: []
    };

    setCustomObjects(prev => [...prev, newObject]);
    setNewObjectForm({ label: '', apiName: '', description: '', parentObject: '' });
    setShowAddObjectModal(false);
  }, [newObjectForm]);

  // Handle custom field creation
  const handleAddField = useCallback(() => {
    if (!newFieldForm.label || !newFieldForm.apiName || !selectedObjectDetails) {
      return;
    }

    const newField: SalesforceField = {
      name: newFieldForm.apiName,
      label: newFieldForm.label,
      type: newFieldForm.dataType,
      required: false,
      description: newFieldForm.description,
      isCustom: true
    };

    setObjectFields(prev => [...prev, newField]);

    // Update object field count
    if (selectedObjectDetails.isCustom) {
      setCustomObjects(prev =>
        prev.map(obj =>
          obj.name === selectedObjectDetails.name
            ? { ...obj, fieldCount: obj.fieldCount + 1 }
            : obj
        )
      );
    }

    setNewFieldForm({ label: '', apiName: '', dataType: 'string', description: '' });
    setShowAddFieldModal(false);
  }, [newFieldForm, selectedObjectDetails]);

  // Handle child object creation
  const handleAddChildObject = useCallback(() => {
    if (!newChildObjectForm.label || !newChildObjectForm.apiName || !selectedObjectDetails) {
      return;
    }

    const newChildObject: ChildObject = {
      label: newChildObjectForm.label,
      apiName: newChildObjectForm.apiName,
      relationshipType: newChildObjectForm.relationshipType,
      description: newChildObjectForm.description
    };

    // Update the selected object's child objects
    if (selectedObjectDetails.isCustom) {
      setCustomObjects(prev =>
        prev.map(obj =>
          obj.name === selectedObjectDetails.name
            ? { ...obj, childObjects: [...(obj.childObjects || []), newChildObject] }
            : obj
        )
      );
    }

    setNewChildObjectForm({ label: '', apiName: '', relationshipType: 'Lookup', description: '' });
    setShowAddChildObjectModal(false);
  }, [newChildObjectForm, selectedObjectDetails]);

  const handleObjectSelect = useCallback((objectName: string) => {
    onSelectObject(objectName);
  }, [onSelectObject]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, objectName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleObjectSelect(objectName);
    }
  }, [handleObjectSelect]);

  const canProceed = Boolean(selectedObject);

  if (loadingObjects) {
    return (
      <div className="step-container loading-state">
        <div className="loading-content">
          <div className="loading-spinner">
            <svg className="spinner" viewBox="0 0 24 24">
              <circle
                className="spinner-circle"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>
          <p>Loading Salesforce objects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container" role="main" aria-labelledby="step3-heading">
      <div className="step-header">
        <h4 id="step3-heading" className="step-title">Object Selection</h4>
        <p className="step-description">
          Choose the Salesforce object you want to synchronize. You can search by object name or label.
        </p>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="object-selection-container">
        {/* Search and Add Custom Object */}
        <div className="search-section">
          <div className="search-row">
            <div className="search-input-wrapper">
              <Input
                type="text"
                id="object-search"
                name="search"
                label="Search Objects"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by object name or label..."
                aria-describedby="search-help"
              />
              <div id="search-help" className="field-help">
                Found {filteredObjects.length} object{filteredObjects.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            </div>
            <div className="add-custom-object-wrapper">
              <Button
                variant="outline"
                onClick={() => setShowAddObjectModal(true)}
                className="add-custom-object-btn"
              >
                + Add Custom Object
              </Button>
            </div>
          </div>
        </div>

        <div className="objects-grid-container">
            {/* Objects List Section */}
            <div className="objects-section">
              <div className="objects-grid" role="radiogroup" aria-labelledby="step3-heading">
                {filteredObjects.length === 0 ? (
                  <div className="no-objects">
                    <p>No objects found matching your search criteria.</p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Standard Objects */}
                    {standardObjects.length > 0 && (
                      <div className="object-group">
                        <h5 className="group-title">Standard Objects</h5>
                        <div className="object-cards">
                          {standardObjects.map((object) => (
                            <ObjectCard
                              key={object.name}
                              object={object}
                              isSelected={selectedObject === object.name}
                              onSelect={handleObjectSelect}
                              onKeyDown={handleKeyDown}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Objects */}
                    {customObjectsFiltered.length > 0 && (
                      <div className="object-group">
                        <h5 className="group-title">Custom Objects</h5>
                        <div className="object-cards">
                          {customObjectsFiltered.map((object) => (
                            <ObjectCard
                              key={object.name}
                              object={object}
                              isSelected={selectedObject === object.name}
                              onSelect={handleObjectSelect}
                              onKeyDown={handleKeyDown}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Selected Object Details Section */}
            {selectedObjectDetails && (
              <div className="details-section">
                {/* Object Info Card */}
                {/* <div className="object-info-card">
                  <div className="card-header">
                    <h3 className="object-title">{selectedObjectDetails.label}</h3>
                    {selectedObjectDetails.isCustom && (
                      <span className="custom-badge">Custom</span>
                    )}
                  </div>

                  <div className="object-details-grid">
                    <div className="detail-row">
                      <span className="label">API Name:</span>
                      <span className="value">{selectedObjectDetails.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Fields:</span>
                      <span className="value">{selectedObjectDetails.fieldCount}</span>
                    </div>
                    {selectedObjectDetails.description && (
                      <div className="detail-row">
                        <span className="label">Description:</span>
                        <span className="value">{selectedObjectDetails.description}</span>
                      </div>
                    )}
                    {selectedObjectDetails.parentObject && (
                      <div className="detail-row">
                        <span className="label">Parent:</span>
                        <span className="value">{selectedObjectDetails.parentObject}</span>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Fields Card */}
                <div className="fields-card">
                  <div className="card-header">
                    <h4 className="card-title">Fields ({objectFields.length})</h4>
                    {selectedObjectDetails.isCustom && (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => setShowAddFieldModal(true)}
                      >
                        + Add Field
                      </Button>
                    )}
                  </div>

                  <div className="fields-content">
                    {loadingFields ? (
                      <div className="loading-message">Loading fields...</div>
                    ) : (
                      <div className="fields-compact-list">
                        {objectFields.slice(0, 12).map((field) => (
                          <div key={field.name} className="field-compact-item">
                            <div className="field-main">
                              <span className="field-label">{field.label}</span>
                              <span className="field-type">{field.type}</span>
                            </div>
                            <div className="field-meta">
                              <span className="field-name">{field.name}</span>
                              {field.required && <span className="required-indicator">*</span>}
                              {field.isCustom && <span className="custom-indicator">C</span>}
                            </div>
                          </div>
                        ))}
                        {objectFields.length > 12 && (
                          <div className="more-fields-indicator">
                            + {objectFields.length - 12} more fields
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Child Objects Card */}
                {(selectedObjectDetails.childObjects?.length || selectedObjectDetails.isCustom) && (
                  <div className="child-objects-card">
                    <div className="card-header">
                      <h4 className="card-title">
                        Related Objects ({selectedObjectDetails.childObjects?.length || 0})
                      </h4>
                      {selectedObjectDetails.isCustom && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => setShowAddChildObjectModal(true)}
                        >
                          + Add Child
                        </Button>
                      )}
                    </div>

                    {selectedObjectDetails.childObjects?.length ? (
                      <div className="child-objects-content">
                        {selectedObjectDetails.childObjects.map((child, index) => (
                          <div key={index} className="child-compact-item">
                            <div className="child-main">
                              <span className="child-label">{child.label}</span>
                              <span className="relationship-type">{child.relationshipType}</span>
                            </div>
                            <div className="child-api-name">{child.apiName}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-child-objects">No related objects defined</div>
                    )}
                  </div>
                )}

                <div className="preview-note">
                  <span className="info-icon">ℹ️</span>
                  <span>Field mapping and configuration will be available in the next step.</span>
                </div>
              </div>
            )}
        </div>
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
          onClick={onNext}
          disabled={!canProceed || isLoading}
          loading={isLoading}
          aria-describedby="next-help"
        >
          Continue to Field Mapping
        </Button>

        <div id="next-help" className="button-help">
          {!canProceed && 'Please select a Salesforce object to continue'}
        </div>
      </div>

      {/* Modals */}
      <AddCustomObjectModal
        isOpen={showAddObjectModal}
        onClose={() => setShowAddObjectModal(false)}
        onSubmit={handleAddCustomObject}
        formData={newObjectForm}
        onFormChange={setNewObjectForm}
        existingObjects={[...objects, ...customObjects]}
      />

      <AddFieldModal
        isOpen={showAddFieldModal}
        onClose={() => setShowAddFieldModal(false)}
        onSubmit={handleAddField}
        formData={newFieldForm}
        onFormChange={setNewFieldForm}
        existingFields={objectFields}
      />

      <AddChildObjectModal
        isOpen={showAddChildObjectModal}
        onClose={() => setShowAddChildObjectModal(false)}
        onSubmit={handleAddChildObject}
        formData={newChildObjectForm}
        onFormChange={setNewChildObjectForm}
        parentObject={selectedObjectDetails}
      />
    </div>
  );
};

// ObjectCard Component
interface ObjectCardProps {
  object: SalesforceObject;
  isSelected: boolean;
  onSelect: (objectName: string) => void;
  onKeyDown: (event: React.KeyboardEvent, objectName: string) => void;
}

const ObjectCard: React.FC<ObjectCardProps> = ({ object, isSelected, onSelect, onKeyDown }) => (
  <div
    className={`object-card ${isSelected ? 'selected' : ''} ${object.isCustom ? 'custom' : ''}`}
    onClick={() => onSelect(object.name)}
    onKeyDown={(e) => onKeyDown(e, object.name)}
    role="radio"
    aria-checked={isSelected}
    aria-describedby={`object-${object.name}-details`}
  >
    <div className="object-header">
      <div className="object-icon">
        {getObjectIcon(object.name, object.isCustom)}
      </div>
      <div className="object-info">
        <h3 className="object-label">
          {object.label}
          {object.isCustom && <span className="custom-indicator">Custom</span>}
        </h3>
        <div className="object-name">{object.name}</div>
      </div>
      <div className="selection-indicator">
        {isSelected && (
          <span className="selected-icon" aria-hidden="true">✓</span>
        )}
      </div>
    </div>

    <div id={`object-${object.name}-details`} className="object-details">
      <div className="field-count">
        <span className="count-number">{object.fieldCount}</span>
        <span className="count-label">fields</span>
      </div>
      {object.description && (
        <div className="object-description">{object.description}</div>
      )}
      {object.parentObject && (
        <div className="parent-object">Parent: {object.parentObject}</div>
      )}
    </div>
  </div>
);

// Helper function to get icon for object type
function getObjectIcon(objectName: string, isCustom?: boolean): string {
  if (isCustom) {
    return '🔧';
  }

  const iconMap: Record<string, string> = {
    Account: '🏢',
    Contact: '👤',
    Lead: '🎯',
    Opportunity: '💰',
    Case: '📋',
    Product2: '📦',
    User: '👥',
    Campaign: '📢',
    Task: '✅',
    Event: '📅'
  };

  return iconMap[objectName] || '📊';
}

// Move all modal components outside the main component to prevent re-creation
// Add Custom Object Modal Component
interface AddCustomObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    label: string;
    apiName: string;
    description: string;
    parentObject: string;
  };
  onFormChange: React.Dispatch<React.SetStateAction<{
    label: string;
    apiName: string;
    description: string;
    parentObject: string;
  }>>;
  existingObjects: SalesforceObject[];
}

const AddCustomObjectModal: React.FC<AddCustomObjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  existingObjects
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const generateApiName = (label: string) => {
    return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') + '__c';
  };

  const handleLabelChange = (label: string) => {
    onFormChange(prev => ({
      ...prev,
      label,
      apiName: prev.apiName || generateApiName(label)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Object" size="medium">
      <form onSubmit={handleSubmit} className="add-object-form">
        <div className="form-grid">
          <Input
            type="text"
            id="object-label"
            name="label"
            label="Object Label"
            value={formData.label}
            onChange={handleLabelChange}
            placeholder="e.g., Project Task"
            required
          />

          <Input
            type="text"
            id="object-api-name"
            name="apiName"
            label="API Name"
            value={formData.apiName}
            onChange={(value) => onFormChange(prev => ({ ...prev, apiName: value }))}
            placeholder="e.g., Project_Task__c"
            required
          />

          <div className="form-field">
            <label htmlFor="object-description">Description</label>
            <textarea
              id="object-description"
              name="description"
              value={formData.description}
              onChange={(e) => onFormChange(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this object..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-field">
            <label htmlFor="parent-object">Parent Object (Optional)</label>
            <select
              id="parent-object"
              value={formData.parentObject}
              onChange={(e) => onFormChange(prev => ({ ...prev, parentObject: e.target.value }))}
              className="form-select"
            >
              <option value="">Select a parent object...</option>
              {existingObjects.map((obj) => (
                <option key={obj.name} value={obj.name}>
                  {obj.label} ({obj.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!formData.label || !formData.apiName}>
            Add Object
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add Field Modal Component
interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    label: string;
    apiName: string;
    dataType: string;
    description: string;
  };
  onFormChange: React.Dispatch<React.SetStateAction<{
    label: string;
    apiName: string;
    dataType: string;
    description: string;
  }>>;
  existingFields: SalesforceField[];
}

const AddFieldModal: React.FC<AddFieldModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const generateApiName = (label: string) => {
    return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') + '__c';
  };

  const handleLabelChange = (label: string) => {
    onFormChange(prev => ({
      ...prev,
      label,
      apiName: prev.apiName || generateApiName(label)
    }));
  };

  const dataTypes = [
    { value: 'string', label: 'Text' },
    { value: 'textarea', label: 'Long Text Area' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'int', label: 'Number' },
    { value: 'double', label: 'Number (Decimal)' },
    { value: 'currency', label: 'Currency' },
    { value: 'percent', label: 'Percent' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date/Time' },
    { value: 'boolean', label: 'Checkbox' },
    { value: 'picklist', label: 'Picklist' },
    { value: 'reference', label: 'Lookup Relationship' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Field" size="medium">
      <form onSubmit={handleSubmit} className="add-field-form">
        <div className="form-grid">
          <Input
            type="text"
            id="field-label"
            name="label"
            label="Field Label"
            value={formData.label}
            onChange={handleLabelChange}
            placeholder="e.g., Priority Level"
            required
          />

          <Input
            type="text"
            id="field-api-name"
            name="apiName"
            label="API Name"
            value={formData.apiName}
            onChange={(value) => onFormChange(prev => ({ ...prev, apiName: value }))}
            placeholder="e.g., Priority_Level__c"
            required
          />

          <div className="form-field">
            <label htmlFor="data-type">Data Type</label>
            <select
              id="data-type"
              value={formData.dataType}
              onChange={(e) => onFormChange(prev => ({ ...prev, dataType: e.target.value }))}
              className="form-select"
              required
            >
              {dataTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="field-description">Description</label>
            <textarea
              id="field-description"
              name="description"
              value={formData.description}
              onChange={(e) => onFormChange(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this field..."
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!formData.label || !formData.apiName}>
            Add Field
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add Child Object Modal Component
interface AddChildObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    label: string;
    apiName: string;
    relationshipType: 'Lookup' | 'Master-Detail' | 'Hierarchical';
    description: string;
  };
  onFormChange: React.Dispatch<React.SetStateAction<{
    label: string;
    apiName: string;
    relationshipType: 'Lookup' | 'Master-Detail' | 'Hierarchical';
    description: string;
  }>>;
  parentObject: SalesforceObject | null;
}

const AddChildObjectModal: React.FC<AddChildObjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  parentObject
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const generateApiName = (label: string) => {
    return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') + '__c';
  };

  const handleLabelChange = (label: string) => {
    onFormChange(prev => ({
      ...prev,
      label,
      apiName: prev.apiName || generateApiName(label)
    }));
  };

  const relationshipTypes = [
    { value: 'Lookup', label: 'Lookup Relationship', description: 'Loosely coupled relationship' },
    { value: 'Master-Detail', label: 'Master-Detail Relationship', description: 'Tightly coupled relationship' },
    { value: 'Hierarchical', label: 'Hierarchical Relationship', description: 'Self-referencing relationship' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Child Object" size="medium">
      <form onSubmit={handleSubmit} className="add-child-object-form">
        <div className="form-grid">
          <div className="form-field">
            <label>Parent Object</label>
            <div className="parent-object-display">
              {parentObject?.label} ({parentObject?.name})
            </div>
          </div>

          <Input
            type="text"
            id="child-label"
            name="label"
            label="Child Object Label"
            value={formData.label}
            onChange={handleLabelChange}
            placeholder="e.g., Project Milestone"
            required
          />

          <Input
            type="text"
            id="child-api-name"
            name="apiName"
            label="API Name"
            value={formData.apiName}
            onChange={(value) => onFormChange(prev => ({ ...prev, apiName: value }))}
            placeholder="e.g., Project_Milestone__c"
            required
          />

          <div className="form-field">
            <label htmlFor="relationship-type">Relationship Type</label>
            <select
              id="relationship-type"
              value={formData.relationshipType}
              onChange={(e) => onFormChange(prev => ({ ...prev, relationshipType: e.target.value as any }))}
              className="form-select"
              required
            >
              {relationshipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="field-help">
              {relationshipTypes.find(t => t.value === formData.relationshipType)?.description}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="child-description">Description</label>
            <textarea
              id="child-description"
              name="description"
              value={formData.description}
              onChange={(e) => onFormChange(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this child object..."
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!formData.label || !formData.apiName}>
            Add Child Object
          </Button>
        </div>
      </form>
    </Modal>
  );
};