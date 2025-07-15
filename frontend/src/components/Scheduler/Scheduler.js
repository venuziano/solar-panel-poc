import React, { useState, useMemo } from 'react'
import { State } from 'country-state-city'
import { Button } from 'react-bootstrap'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createInstallation } from '../../utils/api'

import './Scheduler.css'

function Scheduler() {
  const queryClient = useQueryClient()

  const createInstallationMutation = useMutation({
    mutationFn: payload => createInstallation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installations'] })
    },
  })

  const [formData, setFormData] = useState({
    date: '',
    state: '',
    address: '',
    panelCapacity_kW: '',
    efficiency: '',
    electricityRate: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState('')

  // Only load US states
  const stateOptions = useMemo(
    () =>
      State.getStatesOfCountry('US').map(s => ({
        label: s.name,
        value: s.isoCode,
      })),
    []
  )

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(fd => ({ ...fd, [name]: value }))
    setErrors(errs => ({ ...errs, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!formData.date) errs.date = 'Date is required'
    if (!formData.address.trim()) errs.address = 'City/Address is required'
    if (!formData.state) errs.state = 'State is required'

    const pc = parseFloat(formData.panelCapacity_kW)
    if (isNaN(pc) || pc < 0.1)
      errs.panelCapacity_kW = 'Panel capacity must be ≥ 0.1 kW'

    const ef = parseFloat(formData.efficiency)
    if (isNaN(ef) || ef < 0 || ef > 1)
      errs.efficiency = 'Efficiency must be between 0 and 1'

    const er = parseFloat(formData.electricityRate)
    if (isNaN(er) || er < 0)
      errs.electricityRate = 'Electricity rate must be non-negative'

    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    setSuccess('')

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        date: formData.date,
        address: formData.address,
        state: formData.state,
        panelCapacity_kW: parseFloat(formData.panelCapacity_kW),
        efficiency: parseFloat(formData.efficiency),
        electricityRate: parseFloat(formData.electricityRate),
      }
      await createInstallationMutation.mutateAsync(payload)
      setSuccess('Installation scheduled successfully!')
      setFormData({
        date: '',
        state: '',
        address: '',
        panelCapacity_kW: '',
        efficiency: '',
        electricityRate: '',
      })
      setErrors({})
    } catch (err) {
      console.error(err)
      setApiError('Failed to schedule installation')
    } finally {
      setIsLoading(false)
    }
  }

  const renderError = field =>
    errors[field] && <div className="field-error">{errors[field]}</div>

  return (
    <div className="scheduler">
      <h2>Schedule New Installation</h2>
      {apiError && <div className="error-message">{apiError}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="grid-form">
        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
          {renderError('date')}
        </div>

        {/* City / Address */}
        <div className="form-group">
          <label htmlFor="address">City / Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Houston"
          />
          {renderError('address')}
        </div>

        {/* State selector (US only) */}
        <div className="form-group">
          <label htmlFor="state">State</label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
          >
            <option value="">Select state</option>
            {stateOptions.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {renderError('state')}
        </div>

        {/* Panel capacity */}
        <div className="form-group">
          <label htmlFor="panelCapacity_kW">Panel Capacity (kW)</label>
          <input
            type="number"
            id="panelCapacity_kW"
            name="panelCapacity_kW"
            value={formData.panelCapacity_kW}
            onChange={handleChange}
            min="0.1"
            step="0.1"
          />
          {renderError('panelCapacity_kW')}
        </div>

        {/* Efficiency */}
        <div className="form-group">
          <label htmlFor="efficiency">Efficiency (0–1)</label>
          <input
            type="number"
            id="efficiency"
            name="efficiency"
            value={formData.efficiency}
            onChange={handleChange}
            min="0"
            max="1"
            step="0.01"
          />
          {renderError('efficiency')}
        </div>

        {/* Electricity rate */}
        <div className="form-group">
          <label htmlFor="electricityRate">Electricity Rate ($)</label>
          <input
            type="number"
            id="electricityRate"
            name="electricityRate"
            value={formData.electricityRate}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          {renderError('electricityRate')}
        </div>

        <Button
          type="submit"
          className="full-width btn-gradient"
          disabled={isLoading}
        >
          {isLoading ? 'Scheduling…' : 'Schedule Installation'}
        </Button>
      </form>
    </div>
  )
}

export default Scheduler
