'use strict';

const express = require('express');
const router = express.Router();

const SERVICES = {
  nim: {
    label: 'MCNC_Core_Nim_Bridge',
    url: () => (process.env.ORACLE_NIM_URL || 'http://100.124.198.111:8787').trim(),
    token: () => (process.env.ORACLE_NIM_TOKEN || '').trim()
  },
  cmf: {
    label: 'Chief_Madothi_Fund_Worker',
    url: () => (process.env.ORACLE_CMF_URL || 'http://100.124.198.111:8788').trim(),
    token: () => (process.env.ORACLE_CMF_TOKEN || '').trim()
  },
  campaigns: {
    label: 'Automated_Campaigns_Worker',
    url: () => (process.env.ORACLE_CAMPAIGNS_URL || 'http://100.124.198.111:8789').trim(),
    token: () => (process.env.ORACLE_CAMPAIGNS_TOKEN || '').trim()
  },
  bsa: {
    label: 'Becks_Soccer_Academy_Worker',
    url: () => (process.env.ORACLE_BSA_URL || 'http://100.124.198.111:8790').trim(),
    token: () => (process.env.ORACLE_BSA_TOKEN || '').trim()
  }
};

async function forwardToOracle(serviceKey, endpointPath, method = 'GET', body = null) {
  const svc = SERVICES[serviceKey];
  const baseUrl = svc.url();
  const token = svc.token();

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${endpointPath}`, options);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: response.status, data };
}

router.get('/health', async (req, res) => {
  const results = {};
  for (const key of Object.keys(SERVICES)) {
    try {
      const { status, data } = await forwardToOracle(key, '/health', 'GET');
      results[key] = { reachable: status === 200, status, ...data };
    } catch (err) {
      results[key] = { reachable: false, error: err.message };
    }
  }
  res.json({
    status: 'OK',
    bridgeNode: 'Base_One',
    oracleNode: 'warlord-oracle-vnic',
    services: results,
    timestamp: new Date().toISOString()
  });
});

// NVIDIA NIM Inference Proxy (Port 8787)
router.post('/infer', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('nim', '/v1/infer', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle NIM bridge unreachable', message: err.message });
  }
});

// Chief Madothi Fund Worker Routes (Port 8788)
router.get('/cmf/state', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('cmf', '/v1/state', 'GET');
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle CMF worker unreachable', message: err.message });
  }
});

router.post('/cmf/campaign/upsert', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('cmf', '/v1/campaign/upsert', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle CMF worker unreachable', message: err.message });
  }
});

router.delete('/cmf/campaign/:id', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('cmf', `/v1/campaign/${encodeURIComponent(req.params.id)}`, 'DELETE');
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle CMF worker unreachable', message: err.message });
  }
});

router.post('/cmf/run', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('cmf', '/v1/run', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle CMF worker unreachable', message: err.message });
  }
});

// Automated Campaigns Worker Routes (Port 8789)
router.get('/campaigns/state', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('campaigns', '/v1/state', 'GET');
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle Automated Campaigns worker unreachable', message: err.message });
  }
});

router.post('/campaigns/upsert', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('campaigns', '/v1/campaign/upsert', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle Automated Campaigns worker unreachable', message: err.message });
  }
});

router.post('/campaigns/archive', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('campaigns', '/v1/campaign/archive', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle Automated Campaigns worker unreachable', message: err.message });
  }
});

router.delete('/campaigns/:id', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('campaigns', `/v1/campaign/${encodeURIComponent(req.params.id)}`, 'DELETE');
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle Automated Campaigns worker unreachable', message: err.message });
  }
});

router.post('/campaigns/run', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('campaigns', '/v1/run', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle Automated Campaigns worker unreachable', message: err.message });
  }
});

// Becks Soccer Academy Worker Routes (Port 8790)
router.get('/bsa/state', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('bsa', '/v1/state', 'GET');
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle BSA worker unreachable', message: err.message });
  }
});

router.post('/bsa/campaign/upsert', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('bsa', '/v1/campaign/upsert', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle BSA worker unreachable', message: err.message });
  }
});

router.post('/bsa/campaign/archive', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('bsa', '/v1/campaign/archive', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle BSA worker unreachable', message: err.message });
  }
});

router.delete('/bsa/campaign/:id', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('bsa', `/v1/campaign/${encodeURIComponent(req.params.id)}`, 'DELETE');
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle BSA worker unreachable', message: err.message });
  }
});

router.post('/bsa/run', async (req, res) => {
  try {
    const { status, data } = await forwardToOracle('bsa', '/v1/run', 'POST', req.body);
    res.status(status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Oracle BSA worker unreachable', message: err.message });
  }
});

module.exports = router;
