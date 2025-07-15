import React, { useState } from 'react';
import { createInstallation } from '../../utils/api';

function Scheduler({ token }) {
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    estimatedCostSavings: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
frontend/src/components/Scheduler/Scheduler.js
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await createInstallation(token, formData);
      setSuccess('Installation scheduled successfully!');
      setFormData({
        date: '',
        location: '',
        estimatedCostSavings: ''
      });
    } catch (err) {
      setError('Failed to schedule installation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scheduler">
      <h2>Schedule New Installation</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Installation Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="estimatedCostSavings">Estimated Cost Savings ($)</label>
          <input
            type="number"
            id="estimatedCostSavings"
            name="estimatedCostSavings"
            value={formData.estimatedCostSavings}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Scheduling...' : 'Schedule Installation'}
        </button>
      </form>
    </div>
  );
}

export default Scheduler;
