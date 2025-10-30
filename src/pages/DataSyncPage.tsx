import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { JobWizard } from '../features/create-job/JobWizard';
import { ViewJobsPage } from '../features/jobs/ViewJobsPage';

interface JobApiData {
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

interface StatCardProps {
  icon?: string;
  title: string;
  number: string;
  change: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, number, change, onClick, clickable = false }) => (
  <div
    className={`ds-stat-card ${clickable ? 'ds-clickable' : ''}`}
    onClick={onClick}
    style={{ cursor: clickable ? 'pointer' : 'default' }}
  >
    <div className="ds-stat-header">
      <div className="ds-stat-meta">
        <span className="ds-stat-title">{title}</span>
        {change && <span className="ds-stat-change">{change}</span>}
      </div>
      {icon && <div className="ds-stat-icon">{icon}</div>}
    </div>
    <div className="ds-stat-main">
      <div className="ds-stat-number">{number}</div>
    </div>
  </div>
);

const DataSyncDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobApiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://syncsfdc-j39330.5sc6y6-3.usa-e2.cloudhub.io/readJobsSfdc');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobApiData[] = await response.json();
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

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.isActive === 'true').length;
  const inactiveJobs = jobs.filter(job => job.isActive === 'false').length;

  const handleCreateNewJob = () => {
    // Clear localStorage items for a fresh start
    localStorage.removeItem('job-wizard-draft');
    localStorage.removeItem('jobWizard_sourceConnection');
    localStorage.removeItem('jobWizard_targetConnection');

    // Navigate to create job page
    navigate('/data-sync/create-job');
  };

  return (
    <div className="ds-dashboard">
      {/* Statistics Dashboard */}
      <div className="ds-stats-section">
        {error && (
          <div className="ds-error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
            Error loading job statistics: {error}
          </div>
        )}
        <div className="ds-stats-grid">
          <StatCard
            title="Total Jobs"
            number={isLoading ? "..." : totalJobs.toString()}
            change=""
            onClick={() => navigate('/data-sync/job-details')}
            clickable={true}
          />
          <StatCard
            title="Active Jobs"
            number={isLoading ? "..." : activeJobs.toString()}
            change=""
            onClick={() => navigate('/data-sync/job-details')}
            clickable={true}
          />
          <StatCard
            title="Inactive Jobs"
            number={isLoading ? "..." : inactiveJobs.toString()}
            change=""
            clickable={false}
          />
        </div>
      </div>
      {/* Professional Introduction */}
      <div className="ds-service-introduction">
        <h2 className="ds-main-title">Data Synchronization Service</h2>
        <p className="ds-description-text">
          Our Data Synchronization Service is engineered to provide robust data migration and protection solutions.
          It ensures the integrity and accessibility of your critical assets by facilitating secure, high-speed transfers.
          All data in transit is protected through industry-standard encryption and rigorously validated upon completion,
          guaranteeing both confidentiality and accuracy.
        </p>
      </div>

      {/* Call-to-Action Buttons */}
      <div className="ds-action-buttons-section">
        <div className="ds-cta-buttons">
          <button
            className="ds-action-btn ds-primary-action"
            onClick={handleCreateNewJob}
            aria-label="Create a new data synchronization job"
          >
            <span className="ds-btn-icon">➕</span>
            <span className="ds-btn-text">Create New Job</span>
            <span className="ds-btn-description">Set up a new data synchronization task</span>
          </button>

          <button
            className="ds-action-btn ds-secondary-action"
            onClick={() => navigate('/data-sync/job-details')}
            aria-label="View and manage existing jobs"
          >
            <span className="ds-btn-icon">📋</span>
            <span className="ds-btn-text">Job Details</span>
            <span className="ds-btn-description">View and manage all synchronization jobs</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const DataSyncPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/data-sync');
  };

  const handleCreateJob = () => {
    // Clear localStorage items for a fresh start
    localStorage.removeItem('job-wizard-draft');
    localStorage.removeItem('jobWizard_sourceConnection');
    localStorage.removeItem('jobWizard_targetConnection');

    // Navigate to create job page
    navigate('/data-sync/create-job');
  };

  const renderCurrentView = () => {
    const path = location.pathname;

    if (path === '/data-sync/create-job') {
      return <JobWizard onExit={() => navigate('/data-sync')} />;
    } else if (path === '/data-sync/job-details') {
      return (
        <ViewJobsPage
          onBackToDashboard={handleBackToDashboard}
          onCreateJob={handleCreateJob}
        />
      );
    } else {
      return <DataSyncDashboard />;
    }
  };

  return (
    <div className="ds-page">
      {renderCurrentView()}
    </div>
  );
};

export default DataSyncPage;