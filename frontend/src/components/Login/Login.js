import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert
} from 'react-bootstrap';

import { login } from '../../utils/api';

import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const resp = await login(username, password);
      onLogin(resp.user, resp.token);
    } catch {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="custom-view-port">
      <Row className="h-100">
        <Col
          xs={12}
          md={6}
          className="d-flex align-items-center justify-content-center bg-white"
        >
          <Card className="login-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="mt-3">Solar Company</h3>
                <p className="text-muted">Please login to your account</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="username" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-4">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 mb-3 btn-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in…' : 'LOG IN'}
                </Button>

                <div className="text-center mb-3">
                  <a href="#" className="text-decoration-none">
                    Forgot password?
                  </a>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-none d-md-flex align-items-center justify-content-center grad-panel"
        >
          <div className="text-white text-center px-4">
            <h2>Installation Scheduler</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
