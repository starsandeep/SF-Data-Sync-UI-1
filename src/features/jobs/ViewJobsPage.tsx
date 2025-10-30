import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ViewJobsPageProps {
  onBackToDashboard?: () => void;
  onCreateJob?: () => void;
}

interface JobData {
  Id: string;
  jobName: string | null;
  name: string;
  isActive: string;
  jobSchedule: string | null;
  jobFrequency: string | null;
  sourceOrg: string;
  targetOrg: string;
  sourceObject: string;
  targetObject: string;
  fromDate: string;
  toDate: string;
  jobDetails: {
    name?: string;
    schedule?: {
      frequency?: string;
      timeUnit?: string;
      cronExpression?: string;
      description?: string;
    };
    isActive?: boolean;
    sourceOrg?: string;
    targetOrg?: string;
    fromDate?: string;
    toDate?: string;
    sourceObject?: string;
    targetObject?: string;
    extId?: string;
    fieldMapping?: Array<{
      source: string;
      sourceType?: string;
      target: string;
      targetType?: string;
    }>;
    fieldMaping?: Array<{
      source: string;
      sourceType?: string;
      target: string;
      targetType?: string;
    }>;
  };
}

type ApiResponse = JobData[];

export const ViewJobsPage: React.FC<ViewJobsPageProps> = ({
  onBackToDashboard,
  onCreateJob
}) => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from API
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://syncsfdc-j39330.5sc6y6-3.usa-e2.cloudhub.io/readJobsSfdc');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // No parsing needed - data is already in the correct format
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSchedule = (job: JobData) => {
    // Use jobFrequency if available, otherwise try to construct from jobDetails
    if (job.jobFrequency) {
      return job.jobFrequency;
    }

    if (job.jobDetails.schedule?.frequency && job.jobDetails.schedule?.timeUnit) {
      const unit = job.jobDetails.schedule.timeUnit.toLowerCase();
      const freq = job.jobDetails.schedule.frequency;
      return `Every ${freq} ${unit}`;
    }

    if (job.jobDetails.schedule?.cronExpression) {
      return job.jobDetails.schedule.description || `Cron: ${job.jobDetails.schedule.cronExpression}`;
    }

    return 'Not scheduled';
  };

  const handleEditJob = (job: JobData) => {
    console.log('Edit job:', job.name);
    // TODO: Implement edit functionality
    alert(`Edit job: ${job.name}`);
  };

  const handleDeleteJob = async (job: JobData) => {
    console.log('Delete job:', job.name);

    if (!confirm(`Are you sure you want to delete job "${job.name}"?`)) {
      return;
    }

    try {
      setIsLoading(true);

      // Get field mappings from either fieldMapping or fieldMaping
      const fieldMappings = job.jobDetails.fieldMapping || job.jobDetails.fieldMaping || [];

      // Prepare the request body using the job data
      const requestBody = {
        name: job.name,
        schedule: job.jobDetails.schedule || {
          frequency: "30",
          timeUnit: "MINUTES"
        },
        isActive: job.jobDetails.isActive || false,
        sourceOrg: job.sourceOrg,
        targetOrg: job.targetOrg,
        fromDate: job.fromDate,
        toDate: job.toDate,
        sourceObject: job.sourceObject,
        targetObject: job.targetObject,
        extId: job.jobDetails.extId || 'extid__c',
        fieldMaping: fieldMappings
      };

      console.log('Deleting job with request body:', requestBody);

      const response = await fetch(`https://syncsfdc-j39330.5sc6y6-3.usa-e2.cloudhub.io/deleteJob?key=${encodeURIComponent(job.name)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        console.log('Job deleted successfully');
        // Refresh the job list after successful deletion
        await fetchJobs();
      } else {
        const errorData = await response.text();
        console.error('Delete failed:', response.status, errorData);
        setError(`Failed to delete job: ${response.status} ${response.statusText}. ${errorData}`);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(`Failed to delete job: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ds-jobs-page">
      <style>{`
        .ds-jobs-table .ds-jobs-th:nth-child(7) {
          width: 100px;
          min-width: 100px;
          max-width: 100px;
        }
           .ds-jobs-table .ds-jobs-th:nth-child(2) {
          width: 250px;
          min-width: 250px;
          max-width: 250px;
        }
        .ds-jobs-arrow {
          flex-shrink: 0;
          font-size: 0.75rem;
        }
      `}</style>
      {/* Header Section */}
      <div className="ds-jobs-header">
        <div className="ds-jobs-header-content">
          <h2 className="ds-jobs-title">Job Details</h2>
          {onBackToDashboard && (
            <Button
              variant="outline"
              onClick={onBackToDashboard}
              className="ds-jobs-back-button"
            >
              ← Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="ds-jobs-content">
        {error && (
          <div className="ds-jobs-error" role="alert">
            <span className="ds-jobs-error-icon">⚠️</span>
            <span className="ds-jobs-error-text">{error}</span>
            <Button
              variant="outline"
              size="small"
              onClick={fetchJobs}
              className="ds-jobs-retry-button"
            >
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="ds-jobs-loading">
            <div className="ds-jobs-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="ds-jobs-empty">
            <div className="ds-jobs-empty-icon">📊</div>
            <h3>No jobs found</h3>
            <p>No synchronization jobs are currently configured.</p>
            {onCreateJob && (
              <Button
                variant="primary"
                onClick={onCreateJob}
                className="ds-jobs-empty-action"
              >
                Create Your First Job
              </Button>
            )}
          </div>
        ) : (
          <div className="ds-jobs-table-container">
            <div className="ds-jobs-table-wrapper">
              <table className="ds-jobs-table">
                <thead className="ds-jobs-thead">
                  <tr className="ds-jobs-header-row">
                    <th className="ds-jobs-th">Job Name & Status</th>
                    <th className="ds-jobs-th">Objects</th>
                    <th className="ds-jobs-th">Organizations</th>
                    <th className="ds-jobs-th">Schedule</th>
                    <th className="ds-jobs-th">Duration</th>
                    <th className="ds-jobs-th">Field Mappings</th>
                    <th className="ds-jobs-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="ds-jobs-tbody">
                  {jobs.map((job) => (
                    <tr key={job.Id} className="ds-jobs-row">
                      <td className="ds-jobs-td ds-jobs-name-cell">
                        <div className="ds-jobs-name">{job.name}</div>
                        <div className="ds-jobs-ext-id">ID: {job.Id}</div>
                        <div className="ds-jobs-status">
                          <span className={`ds-jobs-status-badge ${job.isActive === 'true' ? 'active' : 'inactive'}`}>
                            {job.isActive === 'true' ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </div>
                      </td>

                      <td className="ds-jobs-td ds-jobs-objects-cell">
                        <div className="ds-jobs-object-flow">
                          <span className="ds-jobs-source">{job.sourceObject}</span>
                          <span className="ds-jobs-arrow">→</span>
                          <span className="ds-jobs-target">{job.targetObject}</span>
                        </div>
                      </td>

                      <td className="ds-jobs-td ds-jobs-orgs-cell">
                        <div className="ds-jobs-org-flow">
                          <span className="ds-jobs-source-org">{job.sourceOrg}</span>
                          <span className="ds-jobs-arrow">→</span>
                          <span className="ds-jobs-target-org">{job.targetOrg}</span>
                        </div>
                      </td>

                      <td className="ds-jobs-td ds-jobs-schedule-cell">
                        <div className="ds-jobs-schedule">
                          {formatSchedule(job)}
                        </div>
                        {job.jobSchedule && (
                          <div className="ds-jobs-cron">
                            Cron: {job.jobSchedule}
                          </div>
                        )}
                      </td>

                      <td className="ds-jobs-td ds-jobs-duration-cell">
                        <div className="ds-jobs-date-range">
                          <div className="ds-jobs-from">From: {formatDate(job.fromDate)}</div>
                          <div className="ds-jobs-to">To: {formatDate(job.toDate)}</div>
                        </div>
                      </td>

                      <td className="ds-jobs-td ds-jobs-mappings-cell">
                        {(() => {
                          const fieldMappings = job.jobDetails.fieldMapping || job.jobDetails.fieldMaping || [];
                          return (
                            <>
                              <div className="ds-jobs-mappings-count">
                                {fieldMappings.length} field{fieldMappings.length !== 1 ? 's' : ''}
                              </div>
                              <details className="ds-jobs-mappings-details">
                                <summary className="ds-jobs-mappings-summary">View mappings</summary>
                                <div className="ds-jobs-mappings-list">
                                  {fieldMappings.map((mapping, index) => (
                                    <div key={index} className="ds-jobs-mapping-item">
                                      <span className="ds-jobs-mapping-source">{mapping.source}</span>
                                      <span className="ds-jobs-mapping-arrow">→</span>
                                      <span className="ds-jobs-mapping-target">{mapping.target}</span>
                                      {mapping.sourceType && mapping.targetType && (
                                        <div className="ds-jobs-mapping-types">
                                          <span className="ds-jobs-mapping-type">({mapping.sourceType} → {mapping.targetType})</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            </>
                          );
                        })()}
                      </td>

                      <td className="ds-jobs-td ds-jobs-actions-cell">
                        <div className="ds-jobs-actions">
                          <span
                            className="action-icon edit-icon"
                            onClick={() => handleEditJob(job)}
                            aria-label="Edit job"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleEditJob(job);
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </span>
                          <span
                            className={`action-icon delete-icon ${isLoading ? 'disabled' : ''}`}
                            onClick={isLoading ? undefined : () => handleDeleteJob(job)}
                            aria-label="Delete job"
                            role="button"
                            tabIndex={isLoading ? -1 : 0}
                            onKeyDown={isLoading ? undefined : (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleDeleteJob(job);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ds-jobs-footer">
              <div className="ds-jobs-count">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};