// frontend/src/services/api.js

const getApiBase = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  if (typeof window !== 'undefined') {
    // If hosted under a subfolder path like https://trackmyteam.us/hr.trackmyteam.us/
    if (window.location.pathname.startsWith('/hr.trackmyteam.us')) {
      return '/hr.trackmyteam.us/api.php';
    }
  }
  return '/api.php';
};

const API_BASE = getApiBase();

export const getDownloadBridgeUrl = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/hr.trackmyteam.us')) {
    return '/hr.trackmyteam.us/api.php/download/card-bridge';
  }
  return '/api.php/download/card-bridge';
};

export const getSetupGuideUrl = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/hr.trackmyteam.us')) {
    return '/hr.trackmyteam.us/BAHRAIN_SMART_CARD_SETUP_GUIDE.html';
  }
  return '/BAHRAIN_SMART_CARD_SETUP_GUIDE.html';
};

export const api = {
  getToken: () => localStorage.getItem('gulf_hr_token') || '',
  
  setToken: (token) => {
    if (token) localStorage.setItem('gulf_hr_token', token);
    else localStorage.removeItem('gulf_hr_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...options.headers
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Api-Token'] = token;
      headers['X-Auth-Token'] = token;
    }

    const config = {
      cache: 'no-store', // Tells browser and proxies never to serve cached responses
      ...options,
      headers
    };

    let targetUrl = `${API_BASE}${endpoint}`;
    
    // Append dynamic cache-buster timestamp so Nginx and proxies never return stale cache
    const cacheBuster = `_t=${Date.now()}`;
    const sep1 = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${sep1}${cacheBuster}`;

    if (token) {
      targetUrl = `${targetUrl}&token=${encodeURIComponent(token)}`;
    }

    try {
      const res = await fetch(targetUrl, config);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'API request failed');
      }
      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
