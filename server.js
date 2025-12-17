const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.use(cors());
app.use(express.json());

const SAP_URL = 'https://104.196.25.205:50000/b1s/v2';

app.get('/', (req, res) => res.json({ status: 'ok', target: SAP_URL }));

app.all('/b1s/v2/*', async (req, res) => {
  try {
    const path = req.path.replace('/b1s/v2', '');
    const url = `${SAP_URL}${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers['cookie'] || ''
      },
      httpsAgent,
      validateStatus: () => true
    });

    if (response.headers['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }
    
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));
