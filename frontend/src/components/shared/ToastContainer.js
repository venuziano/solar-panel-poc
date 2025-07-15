import React from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'

const NotificationToast = ({
  show,
  onClose,
  title,
  message,
  delay = 3000,
  bg = 'warning',
  position = 'top-end',
  className = 'p-3'
}) => (
  <ToastContainer position={position} className={className}>
    <Toast bg={bg} onClose={onClose} show={show} delay={delay} autohide>
      <Toast.Header>
        <strong className="me-auto">{title}</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  </ToastContainer>
)

export default NotificationToast
