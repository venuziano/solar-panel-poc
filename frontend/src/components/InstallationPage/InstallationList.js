import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  Form,
  Row,
  Col,
  Pagination,
  Spinner,
  Alert,
} from 'react-bootstrap'

import { getInstallations } from '../../utils/api'
import NotificationToast from '../shared/ToastContainer'

const DEFAULT_PAGE_SIZE = 10

export default function InstallationList() {
  const prevEstimateCostSavingsRef = useRef({})

  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(DEFAULT_PAGE_SIZE)
  // In a backend with a database, we can sort fields in ascending (ASC) or descending (DESC) order.
  const [sortOrder, setSortOrder] = useState('asc')

  const queryKey = [
    'installations',
    { status: statusFilter, page, limit, sortOrder },
  ]

  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => getInstallations(statusFilter, page, limit, sortOrder),
    keepPreviousData: true,
    // NOTE: We can do the polling/real time notifications logic using react-query.
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  })
  
  // Logic to simulate a change in the estimate cost saving and the polling/real time notifications.
  useEffect(() => {
    const items = data?.items
    if (!items || items.length === 0) return

    if (Object.keys(prevEstimateCostSavingsRef.current).length === 0) {
      prevEstimateCostSavingsRef.current = items.reduce((m, inst) => {
        m[inst.uuid] = inst.estimatedCostSavings
        return m
      }, {})
      return
    }

    items.forEach(inst => {
      const prev = prevEstimateCostSavingsRef.current[inst.uuid]
      const currentValue = inst.estimatedCostSavings
      if (currentValue !== prev && prev != null && currentValue != null) {
        setToastMsg(
          `Estimate cost saving changed for installment: ${inst.date} | ${inst.address}, ${inst.state}. It was $${prev.toLocaleString()}, now it's $${currentValue.toLocaleString()}.`
        )
        setShowToast(true)
      }
    })

    prevEstimateCostSavingsRef.current = items.reduce((m, inst) => {
      m[inst.uuid] = inst.estimatedCostSavings
      return m
    }, {})
  }, [data?.items])

  const items = data?.items ?? []
  const totalItems = data?.totalItems ?? 0
  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="installation-list">
      <NotificationToast
        show={showToast}
        onClose={() => setShowToast(false)}
        title="Estimated cost changed"
        message={toastMsg}
        delay={6000}
      />

      <Row className="align-items-center mb-3">
        <Col><h2>Installation Appointments</h2></Col>
        <Col md="4">
          <Form.Group as={Row} controlId="statusFilter">
            <Form.Label column sm="5">Filter by status:</Form.Label>
            <Col sm="7">
              <Form.Select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value === 'all' ? null : e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
          </Form.Group>
        </Col>
      </Row>
      {console.log('error', error)}
      {error && <Alert variant="danger">Failed to fetch installations</Alert>}

      {isLoading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : items.length === 0 ? (
        <p>No installations found.</p>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover className="align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Est. Cost Savings</th>
                  {/* We could add a column to display the "Wind" to help technician users */}
                  <th>Weather</th>
                </tr>
              </thead>
              <tbody>
                {items.map(inst => (
                  <tr key={inst.uuid}>
                    <td>{inst.date}</td>
                    <td>{inst.address}, {inst.state}</td>
                    <td className="text-capitalize">{inst.status}</td>
                    <td>${inst.estimatedCostSavings.toLocaleString()}</td>
                    {/* We could have icons to display status and weather details */}
                    <td>{inst.weatherForecast || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)} of {totalItems} records
            </div>
            <Pagination className="mb-0">
              <Pagination.Prev onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === page}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} />
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}
