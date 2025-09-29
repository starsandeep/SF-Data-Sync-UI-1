// Step 5: Test & Schedule Component
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/common/Button';
import { JobData, ScheduleOption } from '../types';

interface Step5TestScheduleProps {
  jobData: JobData;
  onTest: (sampleSize: number, testStartDate?: string, testStartTime?: string, testEndDate?: string, testEndTime?: string) => Promise<void>;
  onUpdateSchedule: (schedule: ScheduleOption, startDate?: string, startTime?: string, customCron?: string, endDate?: string, endTime?: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  error: string | null;
}

interface ScheduleOptionData {
  value: ScheduleOption;
  label: string;
  description: string;
  icon: string;
}

const SCHEDULE_OPTIONS: ScheduleOptionData[] = [
  { value: 'manual', label: 'Manual', description: 'Run manually when needed', icon: '🎯' },
  { value: '30min', label: 'Every 30 minutes', description: 'High frequency sync', icon: '⚡' },
  { value: '1hour', label: 'Every hour', description: 'Regular updates', icon: '🕐' },
  { value: '2hours', label: 'Every 2 hours', description: 'Moderate frequency', icon: '🕑' },
  { value: '6hours', label: 'Every 6 hours', description: 'Four times daily', icon: '🕕' },
  { value: '12hours', label: 'Every 12 hours', description: 'Twice daily', icon: '🕛' },
  { value: 'daily', label: 'Daily', description: 'Once per day', icon: '📅' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week', icon: '📆' },
  { value: '2weeks', label: 'Every 2 weeks', description: 'Bi-weekly sync', icon: '🗓️' },
  { value: 'monthly', label: 'Monthly', description: 'Once per month', icon: '📊' },
];

export const Step5TestSchedule: React.FC<Step5TestScheduleProps> = ({
  jobData,
  onTest,
  onUpdateSchedule,
  onNext,
  onPrevious,
  isLoading,
  error
}) => {
  // Test Job Schedule State
  const [testStartDate, setTestStartDate] = useState<string>(jobData.testStartDate || '');
  const [testStartTime, setTestStartTime] = useState<string>(jobData.testStartTime || '');
  const [testEndDate, setTestEndDate] = useState<string>(jobData.testEndDate || '');
  const [testEndTime, setTestEndTime] = useState<string>(jobData.testEndTime || '');
  const [sampleSize, setSampleSize] = useState<number>(jobData.sampleSize || 50);

  // Main Job Schedule State
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleOption>(jobData.schedule || 'manual');
  const [startDate, setStartDate] = useState<string>(jobData.startDate || '');
  const [startTime, setStartTime] = useState<string>(jobData.startTime || '');
  const [endDate, setEndDate] = useState<string>(jobData.endDate || '');
  const [endTime, setEndTime] = useState<string>(jobData.endTime || '');

  const [testCompleted, setTestCompleted] = useState<boolean>(jobData.tested || false);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);

  // Generate time options with 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: timeStr, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Set default dates and times for test job
  useEffect(() => {
    if (!testStartDate) {
      const now = new Date();
      now.setHours(now.getHours() + 1); // 1 hour from now
      const defaultDate = now.toISOString().split('T')[0];
      setTestStartDate(defaultDate);
    }
    if (!testStartTime) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30 === 0 ? '00' : '30'}`;
      setTestStartTime(timeStr);
    }
    if (!testEndDate && testStartDate) {
      const endDateObj = new Date(testStartDate);
      endDateObj.setHours(endDateObj.getHours() + 2); // 2 hours later for test
      setTestEndDate(endDateObj.toISOString().split('T')[0]);
    }
    if (!testEndTime) {
      const now = new Date();
      now.setHours(now.getHours() + 3);
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30 === 0 ? '00' : '30'}`;
      setTestEndTime(timeStr);
    }
  }, [testStartDate, testStartTime, testEndDate, testEndTime]);

  // Set default dates and times for main job
  useEffect(() => {
    if (!startDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];
      setStartDate(defaultDate);
    }
    if (!startTime) {
      setStartTime('09:00');
    }
    if (!endDate && startDate) {
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + 30); // Default to 30 days later
      setEndDate(endDateObj.toISOString().split('T')[0]);
    }
    if (!endTime) {
      setEndTime('17:00');
    }
  }, [startDate, startTime, endDate, endTime]);

  // Update parent when schedule changes
  useEffect(() => {
    onUpdateSchedule(selectedSchedule, startDate, startTime, undefined, endDate, endTime);
  }, [selectedSchedule, startDate, startTime, endDate, endTime, onUpdateSchedule]);

  const handleTestJob = async () => {
    if (!isTestDateTimeValid) {
      return;
    }
    setIsTestRunning(true);
    try {
      await onTest(sampleSize, testStartDate, testStartTime, testEndDate, testEndTime);
      setTestCompleted(true);
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleScheduleSelect = (schedule: ScheduleOption) => {
    setSelectedSchedule(schedule);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // At least 30 minutes from now
    return {
      minDate: now.toISOString().split('T')[0],
      minTime: now.toTimeString().slice(0, 5)
    };
  };

  const { minDate } = getMinDateTime();

  // Validation functions for test job
  const isTestStartDateTimeValid = testStartDate && testStartTime && new Date(`${testStartDate}T${testStartTime}`) > new Date();
  const isTestEndDateTimeValid = testEndDate && testEndTime && testStartDate && testStartTime &&
    new Date(`${testEndDate}T${testEndTime}`) > new Date(`${testStartDate}T${testStartTime}`);
  const isTestDateTimeValid = isTestStartDateTimeValid && isTestEndDateTimeValid;

  // Validation functions for main job
  const isStartDateTimeValid = startDate && startTime && new Date(`${startDate}T${startTime}`) > new Date();
  const isEndDateTimeValid = endDate && endTime && startDate && startTime &&
    new Date(`${endDate}T${endTime}`) > new Date(`${startDate}T${startTime}`);
  const isMainDateTimeValid = selectedSchedule === 'manual' || (isStartDateTimeValid && isEndDateTimeValid);

  const canProceed = testCompleted && isMainDateTimeValid;

  return (
    <div className="step-container" role="main" aria-labelledby="step5-heading">
      <div className="step-header">
        <h4 id="step5-heading" className="step-title">Test & Schedule</h4>
        <p className="step-description">
          Test your job configuration and set up the synchronization schedule
        </p>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {/* Test Section */}
      <div className="test-schedule-container">
        <div className="test-section">
          <div className="section-card">
            <div className="section-header-inline">
              <div className="section-icon">🧪</div>
              <div className="section-info">
                <h3 className="section-title">Test Job</h3>
                <p className="section-subtitle">
                  Run a test to validate the sync before scheduling. This will process a small sample of data for the given time period you are selecting.
                </p>
              </div>
            </div>

            {/* Test Job Duration */}
            <div className="test-datetime-section">
              <h4 className="subsection-title">
                <span className="subsection-icon">⏱️</span>
                Test Duration
              </h4>
              <p className="subsection-description">
                Select the time period to pick the data changes during the window.
              </p>

              <div className="test-datetime-compact">
                {/* Test Start Date & Time - Single Line */}
                <div className="datetime-line">
                  <div className="line-header">
                    <span className="line-icon">🚀</span>
                    <span className="line-label">Start:</span>
                  </div>
                  <div className="datetime-inputs-inline">
                    <div className="form-group inline">
                      <label htmlFor="test-start-date" className="form-label-inline">
                        Date
                      </label>
                      <input
                        type="date"
                        id="test-start-date"
                        className="form-input date-input-compact focus-primary"
                        value={testStartDate}
                        min={minDate}
                        onChange={(e) => setTestStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group inline">
                      <label htmlFor="test-start-time" className="form-label-inline">
                        Time
                      </label>
                      <select
                        id="test-start-time"
                        className="form-select time-select-compact focus-primary"
                        value={testStartTime}
                        onChange={(e) => setTestStartTime(e.target.value)}
                        required
                      >
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Test End Date & Time - Single Line */}
                <div className="datetime-line">
                  <div className="line-header">
                    <span className="line-icon">🏁</span>
                    <span className="line-label">End:</span>
                  </div>
                  <div className="datetime-inputs-inline">
                    <div className="form-group inline">
                      <label htmlFor="test-end-date" className="form-label-inline">
                        Date
                      </label>
                      <input
                        type="date"
                        id="test-end-date"
                        className="form-input date-input-compact focus-primary"
                        value={testEndDate}
                        min={testStartDate || minDate}
                        onChange={(e) => setTestEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group inline">
                      <label htmlFor="test-end-time" className="form-label-inline">
                        Time
                      </label>
                      <select
                        id="test-end-time"
                        className="form-select time-select-compact focus-primary"
                        value={testEndTime}
                        onChange={(e) => setTestEndTime(e.target.value)}
                        required
                      >
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>


              {/* Test Validation Errors */}
              {!isTestStartDateTimeValid && testStartDate && testStartTime && (
                <div className="datetime-error">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">
                    Test start time must be in the future
                  </span>
                </div>
              )}

              {!isTestEndDateTimeValid && testEndDate && testEndTime && testStartDate && testStartTime && (
                <div className="datetime-error">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">
                    Test end time must be after start time
                  </span>
                </div>
              )}
            </div>

            <div className="test-controls">
              <div className="sample-size-control">
                <label htmlFor="sample-size" className="form-label">
                  Sample Size
                </label>
                <input
                  type="number"
                  id="sample-size"
                  className="form-input"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(parseInt(e.target.value) || 50)}
                  min="10"
                  max="1000"
                  placeholder="Enter sample size"
                  disabled={isTestRunning}
                />
                <span className="help-text">
                  Maximum number of records to process. Change it to dropdown (50, 100, 200, 500, 1000)
                </span>
              </div>

              <Button
                variant="primary"
                onClick={handleTestJob}
                disabled={isTestRunning || isLoading || !isTestDateTimeValid}
                loading={isTestRunning}
                className="test-button"
              >
                {isTestRunning ? 'Running Test...' : 'Run Test'}
              </Button>
            </div>

            {testCompleted && jobData.testResult && (
              <div className="test-results">
                <div className="result-header">
                  <span className="result-icon">
                    {jobData.testResult.success ? '✅' : '⚠️'}
                  </span>
                  <span className="result-status">
                    {jobData.testResult.success ? 'Test Successful' : 'Test Completed with Issues'}
                  </span>
                </div>
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-label">Records Processed:</span>
                    <span className="stat-value">{jobData.testResult.recordsProcessed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Successful:</span>
                    <span className="stat-value success">{jobData.testResult.recordsSucceeded}</span>
                  </div>
                  {jobData.testResult.recordsFailed > 0 && (
                    <div className="stat-item">
                      <span className="stat-label">Failed:</span>
                      <span className="stat-value error">{jobData.testResult.recordsFailed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="schedule-section">
          <div className="section-card">
            <div className="section-header-inline">
              <div className="section-icon">⏰</div>
              <div className="section-info">
                <h3 className="section-title">Schedule</h3>
                <p className="section-subtitle">
                  Choose how often to run this synchronization job
                </p>
              </div>
            </div>

            <div className="schedule-dropdown-section">
              <div className="form-group">
                <label htmlFor="schedule-select" className="form-label">
                  Schedule Frequency
                </label>
                <select
                  id="schedule-select"
                  className="form-select schedule-select"
                  value={selectedSchedule}
                  onChange={(e) => handleScheduleSelect(e.target.value as ScheduleOption)}
                  required
                >
                  {SCHEDULE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                <span className="help-text">
                  How often should this job run automatically?
                </span>
              </div>
            </div>

            {/* Job Schedule Duration - moved inside schedule card */}
            {selectedSchedule !== 'manual' && (
              <div className="job-duration-section">
                <div className="section-divider">
                  <div className="section-icon">📅</div>
                  <div className="section-info">
                    <h4 className="subsection-title">Job Schedule Duration</h4>
                    <p className="subsection-description">
                      Set when your main job should start and end running
                    </p>
                  </div>
                </div>

                <div className="datetime-controls">
                  {/* Main Job Start Date & Time */}
                  <div className="datetime-row">
                    <div className="datetime-group start-group">
                      <h4 className="group-title">
                        <span className="group-icon">🚀</span>
                        Job Start Date & Time
                      </h4>
                      <div className="datetime-inputs">
                        <div className="form-group">
                          <label htmlFor="main-start-date" className="form-label">
                            Start Date
                          </label>
                          <input
                            type="date"
                            id="main-start-date"
                            className="form-input date-input"
                            value={startDate}
                            min={minDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="main-start-time" className="form-label">
                            Start Time
                          </label>
                          <select
                            id="main-start-time"
                            className="form-select time-select"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                          >
                            {timeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Main Job End Date & Time */}
                    <div className="datetime-group end-group">
                      <h4 className="group-title">
                        <span className="group-icon">🏁</span>
                        Job End Date & Time
                      </h4>
                      <div className="datetime-inputs">
                        <div className="form-group">
                          <label htmlFor="main-end-date" className="form-label">
                            End Date
                          </label>
                          <input
                            type="date"
                            id="main-end-date"
                            className="form-input date-input"
                            value={endDate}
                            min={startDate || minDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="main-end-time" className="form-label">
                            End Time
                          </label>
                          <select
                            id="main-end-time"
                            className="form-select time-select"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                          >
                            {timeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Job Duration Preview */}
                  {startDate && startTime && endDate && endTime && isStartDateTimeValid && isEndDateTimeValid && (
                    <div className="duration-preview">
                      <div className="preview-card">
                        <div className="preview-header">
                          <span className="preview-icon">⏱️</span>
                          <span className="preview-title">Main Job Schedule Summary</span>
                        </div>
                        <div className="preview-content">
                          <div className="preview-item">
                            <span className="preview-label">Job starts:</span>
                            <span className="preview-value start-time">
                              {new Date(`${startDate}T${startTime}`).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Job ends:</span>
                            <span className="preview-value end-time">
                              {new Date(`${endDate}T${endTime}`).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          <div className="preview-item duration-item">
                            <span className="preview-label">Total duration:</span>
                            <span className="preview-value duration-value">
                              {(() => {
                                const start = new Date(`${startDate}T${startTime}`);
                                const end = new Date(`${endDate}T${endTime}`);
                                const diffMs = end.getTime() - start.getTime();
                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                return `${diffDays} days, ${diffHours} hours`;
                              })()}
                            </span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Frequency:</span>
                            <span className="preview-value frequency-value">
                              {SCHEDULE_OPTIONS.find(opt => opt.value === selectedSchedule)?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Job Validation Errors */}
                  {!isStartDateTimeValid && startDate && startTime && (
                    <div className="datetime-error">
                      <span className="error-icon">⚠️</span>
                      <span className="error-text">
                        Job start time must be at least 30 minutes from now
                      </span>
                    </div>
                  )}

                  {!isEndDateTimeValid && endDate && endTime && startDate && startTime && (
                    <div className="datetime-error">
                      <span className="error-icon">⚠️</span>
                      <span className="error-text">
                        Job end time must be after start time
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
          Create Job
        </Button>

        <div id="next-help" className="button-help">
          {!testCompleted && 'Please run a test before proceeding'}
          {testCompleted && !isMainDateTimeValid && selectedSchedule !== 'manual' && 'Please set valid start and end times for the main job'}
          {canProceed && 'Ready to create your synchronization job'}
        </div>
      </div>
    </div>
  );
};