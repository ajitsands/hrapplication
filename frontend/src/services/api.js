// frontend/src/services/api.js

const getApiBase = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('trackmyteam.us')) {
    return 'https://trackmyteam.us/hr.trackmyteam.us/api.php';
  }
  return '/api.php';
};

const API_BASE = getApiBase();

export const getDownloadBridgeUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('trackmyteam.us')) {
    return 'https://trackmyteam.us/hr.trackmyteam.us/api.php/download/card-bridge';
  }
  return '/api/download/card-bridge';
};

export const getSetupGuideUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('trackmyteam.us')) {
    return 'https://trackmyteam.us/hr.trackmyteam.us/BAHRAIN_SMART_CARD_SETUP_GUIDE.html';
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
      ...options,
      headers
    };

    let targetUrl = `${API_BASE}${endpoint}`;
    if (token) {
      const sep = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${sep}token=${encodeURIComponent(token)}`;
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
