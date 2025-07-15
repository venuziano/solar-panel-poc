import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Redirect user to the Login page in case the JWT token is expired.
// We could have a refresh token logic
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('session-expired'))
    }
    return Promise.reject(error)
  }
)

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getInstallations = async (status = null, page = 1, limit = 10, sortOrder = 'asc') => {
  try {
    const token = localStorage.getItem('token')
    console.log('token', token)
    // Sanitize parameters
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('limit', String(limit))
    params.append('sort', sortOrder)
    
    if (status != '' && status != null) {
      params.append('status', status)
    }

    const queryString = params.toString()
    
    const response = await api.get(
      `/installations?${queryString}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    // Logic to simulate a change in the estimate cost saving and the polling/real time notifications.
    if (response.data.items?.length) {
      // Handling pagination with only one item.
      (response.data.items[1] ?? response.data.items[0]).estimatedCostSavings += Math.floor(Math.random() * 201) + 100
    }

    return response.data
  } catch (error) {
    throw error;
  }
};

export const createInstallation = async (installationData) => {
  try {
    const token = localStorage.getItem('token')

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    const response = await api.post('/installations', installationData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};