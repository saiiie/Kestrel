require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const SENTINEL_URL = process.env.SENTINEL_URL || 'http://localhost:8080';

// Middleware
// This allows your React app to talk to this server without browser security blocking it
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
axios.defaults.timeout = 15000;
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const getHeaders = (req) => {
    return req.headers.authorization ? { Authorization: req.headers.authorization } : {};
};

// ==========================================
// ROUTES (Forwarding to Spring Boot)
// ==========================================

// Login Route (Forward to AuthController)
app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${SENTINEL_URL}/api/auth/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Login failed' });
    }
});

// Register Route (Forward to AuthController)
app.post('/api/auth/register', async (req, res) => {
    try {
        const response = await axios.post(`${SENTINEL_URL}/api/auth/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Registration failed' });
    }
});

// 1. Create a new alert rule
app.post('/api/rules', async (req, res) => {
    try {
        const response = await axios.post(`${SENTINEL_URL}/api/rules`, req.body, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        console.error("Error creating rule:", error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to create rule' });
    }
});

// 2. Fetch all rules for the frontend dashboard
app.get('/api/rules/user/:userId', async (req, res) => {
    try {
        const response = await axios.get(`${SENTINEL_URL}/api/rules/user/${req.params.userId}`, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch rules' });
    }
});

// 3. Delete a rule (Trash can icon on frontend)
app.delete('/api/rules/:ruleId', async (req, res) => {
    try {
        await axios.delete(`${SENTINEL_URL}/api/rules/${req.params.ruleId}`, { headers: getHeaders(req) });
        res.status(204).send();
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to delete rule' });
    }
});

// 4. Fetch recent activity history
app.get('/api/history/user/:userId', async (req, res) => {
    try {
        const response = await axios.get(`${SENTINEL_URL}/api/history/user/${req.params.userId}`, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch history' });
    }
});

// 5. Clear activity history
app.delete('/api/history/user/:userId', async (req, res) => {
    try {
        await axios.delete(`${SENTINEL_URL}/api/history/user/${req.params.userId}`, { headers: getHeaders(req) });
        res.status(204).send();
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to clear history' });
    }
});

// Fetch form configuration options (Assets & Conditions)
app.get('/api/config/form-options', async (req, res) => {
    try {
        const response = await axios.get(`${SENTINEL_URL}/api/config/form-options`, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch form options' });
    }
});

// Fetch live cached prices
app.get('/api/prices/live', async (req, res) => {
    try {
        const response = await axios.get(`${SENTINEL_URL}/api/prices/live`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch prices' });
    }
});

// Update an existing Alert Rule
app.put('/api/rules/:ruleId', async (req, res) => {
    try {
        const response = await axios.put(`${SENTINEL_URL}/api/rules/${req.params.ruleId}`, req.body, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to update alert rule' });
    }
});

// Fetch User Profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const response = await axios.get(`${SENTINEL_URL}/api/users/${req.params.userId}`, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update User Webhook
app.put('/api/users/:userId/webhook', async (req, res) => {
    try {
        const response = await axios.put(`${SENTINEL_URL}/api/users/${req.params.userId}/webhook`, req.body, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to update webhook' });
    }
});

// Test User Webhook
app.post('/api/users/test-webhook', async (req, res) => {
    try {
        const response = await axios.post(`${SENTINEL_URL}/api/users/test-webhook`, req.body, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Failed to test webhook' });
    }
});

// Update User Profile
app.put('/api/users/:userId/profile', async (req, res) => {
    try {
        const response = await axios.put(`${SENTINEL_URL}/api/users/${req.params.userId}/profile`, req.body, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to update profile' });
    }
});

// Update User Password
app.put('/api/users/:userId/password', async (req, res) => {
    try {
        const response = await axios.put(`${SENTINEL_URL}/api/users/${req.params.userId}/password`, req.body, { headers: getHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to update password' });
    }
});

// Delete User Account
app.delete('/api/users/:userId', async (req, res) => {
    try {
        const response = await axios.delete(`${SENTINEL_URL}/api/users/${req.params.userId}`, { headers: getHeaders(req) });
        res.status(response.status).send();
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to delete account' });
    }
});

// Start the Gateway
app.listen(PORT, () => {
    console.log(`🔀 Kestrel API Gateway is listening on port ${PORT}`);
    console.log(`➡️  Routing traffic to Sentinel at ${SENTINEL_URL}`);
});
