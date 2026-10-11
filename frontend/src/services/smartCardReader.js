/**
 * Bahrain & GCC Smart Card Reader Integration Service
 * Connects React frontend with the BahrainCardBridge (.NET CIO Smart Card Reader Server)
 * Running on: http://localhost:5050/api/operation/ReadCard or ws://localhost:5060/SCardRead
 */

class SmartCardReaderService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isReading = false;
    this.listeners = new Map();
    this.wsUrl = 'ws://localhost:5060/SCardRead';
    this.restUrl = 'http://127.0.0.1:5050/api/operation/ReadCard';
    this.readers = [];
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error(`Error in event listener for ${event}:`, e); }
      });
    }
  }

  // Connect to the local WebSocket service
  connect(url, timeoutMs = 2500) {
    if (url) this.wsUrl = url;

    return new Promise((resolve) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve(true);
          return;
        }

        if (this.ws) {
          try { this.ws.close(); } catch (_) {}
          this.ws = null;
        }

        const targetUrl = url || this.wsUrl;
        const socket = new WebSocket(targetUrl);
        let settled = false;

        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            try { socket.close(); } catch (_) {}
            this.isConnected = false;
            resolve(false);
          }
        }, timeoutMs);

        socket.onopen = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          this.ws = socket;
          this.isConnected = true;
          this.wsUrl = targetUrl;
          this.emit('connectionChange', { status: 'CONNECTED', url: targetUrl });
          resolve(true);
        };

        socket.onerror = (err) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            this.isConnected = false;
            this.emit('connectionChange', { status: 'ERROR', error: err });
            resolve(false);
          }
        };

        socket.onclose = () => {
          if (this.ws === socket) {
            this.isConnected = false;
            this.ws = null;
            this.emit('connectionChange', { status: 'DISCONNECTED' });
          }
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(false);
          }
        };
      } catch (err) {
        this.isConnected = false;
        this.emit('connectionChange', { status: 'FAILED', error: err.message });
        resolve(false);
      }
    });
  }

  async ensureConnected() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return true;
    }

    const candidateUrls = [
      this.wsUrl || 'ws://localhost:5060/SCardRead',
      'ws://127.0.0.1:5060/SCardRead',
      'ws://localhost:5060',
      'ws://127.0.0.1:5060'
    ];

    for (const url of candidateUrls) {
      try {
        const ok = await this.connect(url, 1500);
        if (ok) return true;
      } catch (_) {}
    }

    return false;
  }

  // Quick connection test across REST (Port 5050) and WebSocket (Port 5060)
  async checkBridgeHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('http://127.0.0.1:5050/status', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { online: true, reader: data.reader || '', cardInserted: !!data.cardInserted };
      }
    } catch (_) {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('http://localhost:5050/status', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { online: true, reader: data.reader || '', cardInserted: !!data.cardInserted };
      }
    } catch (_) {}

    return { online: false, reader: '', cardInserted: false };
  }

  // Read smart card via REST or WebSocket
  async readSmartCard(options = {}) {
    this.isReading = true;
    this.emit('readingStart');

    // 1. Primary: REST API (Port 5050 - BahrainCardBridge.exe)
    try {
      const restResult = await this.readViaRest(options);
      this.isReading = false;
      this.emit('readSuccess', restResult);
      return restResult;
    } catch (restErr) {
      console.log('REST read notice:', restErr.message);
      // If card was missing / removed from reader slot, throw specific error immediately
      if (restErr.message && (
        restErr.message.toLowerCase().includes('no card') ||
        restErr.message.toLowerCase().includes('removed') ||
        restErr.message.toLowerCase().includes('not detected') ||
        restErr.message.toLowerCase().includes('not inserted')
      )) {
        this.isReading = false;
        this.emit('readError', restErr);
        throw new Error('Smart Card Reader is detected, but no CPR card was found. Please insert the CPR card firmly into the reader with the gold chip facing in.');
      }
    }

    // 2. Secondary Fallback: WebSocket (Port 5060)
    try {
      const isWsConnected = await this.ensureConnected();
      if (isWsConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        const payload = "ReadCard" + JSON.stringify({
          ReadCardInfo: true,
          ReadPersonalInfo: true,
          ReadAddressDetails: true,
          ReadBiometrics: false,
          ReadEmploymentInfo: true,
          ReadImmigrationDetails: true,
          ReadTrafficDetails: false,
          SilentReading: false,
          ReaderIndex: -1,
          ReaderName: options.readerName || "",
          OutputFormat: "JSON",
          ValidateCard: false
        });

        const cardData = await new Promise((resolve, reject) => {
          let timer = null;

          const onMsg = (event) => {
            try {
              const rawData = event.data;
              if (typeof rawData === 'string' && rawData.includes('ReaderNames') && !rawData.includes('MiscellaneousTextData')) {
                return;
              }

              const json = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
              const misc = json.MiscellaneousTextData || {};
              const hasData = json.CPR || json.IdNumber || json.EnglishFirstName || json.EnglishFullName || misc.CPRNO || misc.FirstNameEnglish;

              if (json.ErrorDescription && !hasData) {
                cleanup();
                if (json.ErrorDescription.toLowerCase().includes('no card') || json.ErrorDescription.toLowerCase().includes('removed')) {
                  reject(new Error('No CPR card detected in the reader. Please insert CPR card.'));
                } else {
                  reject(new Error(json.ErrorDescription));
                }
                return;
              }

              if (hasData) {
                cleanup();
                resolve(this.parseCardPayload(json));
              }
            } catch (parseErr) {
              console.log('WebSocket parse error:', parseErr);
            }
          };

          const onErr = () => {
            cleanup();
            reject(new Error('WebSocket connection error during card read.'));
          };

          const cleanup = () => {
            if (timer) clearTimeout(timer);
            if (this.ws) {
              this.ws.removeEventListener('message', onMsg);
              this.ws.removeEventListener('error', onErr);
            }
          };

          this.ws.addEventListener('message', onMsg);
          this.ws.addEventListener('error', onErr);
          this.ws.send(payload);

          timer = setTimeout(() => {
            cleanup();
            reject(new Error('Card reading timed out (10s). Please ensure card is inserted properly.'));
          }, 10000);
        });

        this.isReading = false;
        this.emit('readSuccess', cardData);
        return cardData;
      }
    } catch (wsErr) {
      console.log('WebSocket read fallback notice:', wsErr.message);
    }

    this.isReading = false;
    const err = new Error(
      'Unable to connect to Bahrain Card Bridge (Port 5050).\n\nPlease ensure you ran "Start_Bahrain_Card_Bridge.bat" and the USB card reader is connected.'
    );
    this.emit('readError', err);
    throw err;
  }

  async readViaRest(options = {}) {
    const candidateUrls = [
      'http://127.0.0.1:5050/api/operation/ReadCard',
      'http://localhost:5050/api/operation/ReadCard',
      options.restUrl || this.restUrl
    ];

    const payload = JSON.stringify({
      ReadCardInfo: true,
      ReadPersonalInfo: true,
      ReadAddressDetails: true,
      ReadBiometrics: false,
      ReadEmploymentInfo: true,
      ReadImmigrationDetails: true,
      ReadTrafficDetails: false,
      SilentReading: false,
      ReaderIndex: -1,
      ReaderName: options.readerName || "",
      OutputFormat: "JSON",
      ValidateCard: false
    });

    let lastError = null;

    for (const targetUrl of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: payload,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          lastError = new Error(`REST reader service returned HTTP status: ${response.status}`);
          continue;
        }

        const json = await response.json();
        const misc = json.MiscellaneousTextData || {};
        const hasData = json.CPR || json.IdNumber || json.EnglishFullName || misc.CPRNO || misc.FirstNameEnglish;

        if (json.ErrorDescription && !hasData) {
          const desc = json.ErrorDescription;
          if (desc.toLowerCase().includes('removed') || desc.toLowerCase().includes('no card') || desc.toLowerCase().includes('not detected') || desc.toLowerCase().includes('not inserted')) {
            throw new Error('Smart Card Reader is online, but no CPR card was detected. Please ensure the card is inserted firmly with the gold chip facing the reader pins.');
          }
          throw new Error(desc);
        }

        if (!hasData) {
          throw new Error(json.ErrorDescription || json.ErrorMessage || 'No cardholder data returned. Please verify card insertion.');
        }

        return this.parseCardPayload(json);
      } catch (err) {
        lastError = err;
        if (err.message && (err.message.includes('no CPR card') || err.message.includes('removed') || err.message.includes('not detected'))) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Unable to connect to Smart Card Bridge service on Port 5050.');
  }

  findFieldValue(obj, ...possibleKeys) {
    if (!obj || typeof obj !== 'object') return null;
    const normalized = {};
    for (const k of Object.keys(obj)) {
      normalized[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = obj[k];
    }
    for (const key of possibleKeys) {
      const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const val = normalized[normKey];
      if (val !== undefined && val !== null) {
        const str = String(val).trim();
        if (str !== '' && str.toLowerCase() !== 'null' && str.toLowerCase() !== 'undefined') {
          return str;
        }
      }
    }
    return null;
  }

  resolveNationality(raw, misc) {
    const code = this.findFieldValue(raw, 'NationalityCode', 'Nationality', 'Country') ||
                 this.findFieldValue(misc, 'NationalityCode', 'Nationality') || '';

    const norm = code.toUpperCase().trim();
    const NATIONALITY_MAP = {
      'BHR': 'Bahraini', 'BAH': 'Bahraini', '048': 'Bahraini', 'BAHRAIN': 'Bahraini', 'BAHRAINI': 'Bahraini',
      'SAU': 'Saudi', '682': 'Saudi', 'SAUDI': 'Saudi', 'SAUDI ARABIA': 'Saudi',
      'KWT': 'Kuwaiti', '414': 'Kuwaiti', 'KUWAIT': 'Kuwaiti', 'KUWAITI': 'Kuwaiti',
      'ARE': 'Emirati', 'UAE': 'Emirati', '784': 'Emirati', 'EMIRATI': 'Emirati', 'UNITED ARAB EMIRATES': 'Emirati',
      'OMN': 'Omani', '512': 'Omani', 'OMAN': 'Omani', 'OMANI': 'Omani',
      'QAT': 'Qatari', '634': 'Qatari', 'QATAR': 'Qatari', 'QATARI': 'Qatari',
      'IND': 'Indian', '356': 'Indian', 'INDIA': 'Indian', 'INDIAN': 'Indian',
      'PAK': 'Pakistani', '586': 'Pakistani', 'PAKISTAN': 'Pakistani', 'PAKISTANI': 'Pakistani',
      'PHL': 'Filipino', '608': 'Filipino', 'PHILIPPINES': 'Filipino', 'FILIPINO': 'Filipino',
      'BGD': 'Bangladeshi', '050': 'Bangladeshi', 'BANGLADESH': 'Bangladeshi', 'BANGLADESHI': 'Bangladeshi',
      'EGY': 'Egyptian', '818': 'Egyptian', 'EGYPT': 'Egyptian', 'EGYPTIAN': 'Egyptian',
      'JOR': 'Jordanian', '400': 'Jordanian', 'JORDAN': 'Jordanian', 'JORDANIAN': 'Jordanian',
      'LBN': 'Lebanese', '422': 'Lebanese', 'LEBANON': 'Lebanese', 'LEBANESE': 'Lebanese',
      'SYR': 'Syrian', '760': 'Syrian', 'SYRIA': 'Syrian',
      'YEM': 'Yemeni', '887': 'Yemeni', 'YEMEN': 'Yemeni',
      'GBR': 'British', '826': 'British', 'UK': 'British', 'BRITISH': 'British',
      'USA': 'American', '840': 'American', 'AMERICAN': 'American',
      'NPL': 'Nepalese', '524': 'Nepalese', 'NEPAL': 'Nepalese',
      'LKA': 'Sri Lankan', '144': 'Sri Lankan', 'SRI LANKA': 'Sri Lankan'
    };

    if (NATIONALITY_MAP[norm]) return NATIONALITY_MAP[norm];
    if (code.length > 2) return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
    return 'Bahraini';
  }

  isGcc(nationality) {
    const gccList = ['Bahraini', 'Saudi', 'Emirati', 'Kuwaiti', 'Omani', 'Qatari'];
    return gccList.includes(nationality) ? 1 : 0;
  }

  parseCardPayload(raw) {
    if (!raw) return null;
    const misc = raw.MiscellaneousTextData || {};

    const cpr = this.findFieldValue(raw, 'CPR', 'IdNumber', 'CPRNO') ||
                this.findFieldValue(misc, 'CPRNO', 'CPR', 'IdNumber') || '';

    // Names
    let firstName = this.findFieldValue(misc, 'FirstNameEnglish') || this.findFieldValue(raw, 'EnglishFirstName') || '';
    let lastName = this.findFieldValue(misc, 'LastNameEnglish') || this.findFieldValue(raw, 'EnglishLastName') || '';
    let fullNameEn = this.findFieldValue(raw, 'EnglishFullName', 'FullNameEnglish', 'NameEn') ||
                     this.findFieldValue(misc, 'EnglishFullName', 'FullNameEnglish') || '';

    if (!firstName && !lastName && fullNameEn) {
      const parts = fullNameEn.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || parts[0] || '';
    } else if (firstName && !fullNameEn) {
      fullNameEn = `${firstName} ${lastName}`.trim();
    }

    const fullNameAr = this.findFieldValue(raw, 'ArabicFullName', 'FullNameArabic', 'NameAr') ||
                       this.findFieldValue(misc, 'ArabicFullName', 'FullNameArabic') || '';

    // Date of Birth formatting
    let rawDob = this.findFieldValue(raw, 'BirthDate', 'DateOfBirth', 'DOB') ||
                 this.findFieldValue(misc, 'DateOfBirth', 'BirthDate', 'DOB') || '';
    let formattedDob = '';
    if (rawDob) {
      if (rawDob.includes('/')) {
        const parts = rawDob.split('/');
        if (parts.length === 3) {
          formattedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      } else if (rawDob.length === 8 && !rawDob.includes('-')) {
        formattedDob = `${rawDob.slice(0, 4)}-${rawDob.slice(4, 6)}-${rawDob.slice(6, 8)}`;
      } else {
        formattedDob = rawDob.slice(0, 10);
      }
    }

    // CPR / Card Expiry Date
    let rawExpiry = this.findFieldValue(raw, 'CardexpiryDate', 'CardExpiryDate', 'CardExpiry', 'ExpiryDate') ||
                    this.findFieldValue(misc, 'CardexpiryDate', 'CardExpiryDate', 'ExpiryDate') || '';
    let formattedExpiry = '';
    if (rawExpiry) {
      if (rawExpiry.includes('/')) {
        const parts = rawExpiry.split('/');
        if (parts.length === 3) {
          formattedExpiry = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      } else if (rawExpiry.length === 8 && !rawExpiry.includes('-')) {
        formattedExpiry = `${rawExpiry.slice(0, 4)}-${rawExpiry.slice(4, 6)}-${rawExpiry.slice(6, 8)}`;
      } else {
        formattedExpiry = rawExpiry.slice(0, 10);
      }
    }

    // Gender
    const rawGender = this.findFieldValue(raw, 'Gender', 'Sex') || this.findFieldValue(misc, 'Gender', 'Sex') || '';
    const gender = (rawGender.toUpperCase().startsWith('F') || rawGender === '2') ? 'Female' : 'Male';

    // Nationality & GCC
    const nationality = this.resolveNationality(raw, misc);
    const isGccCitizen = this.isGcc(nationality);

    // Contact
    const phone = this.findFieldValue(misc, 'ContactNo', 'MobileNumber', 'Phone') ||
                  this.findFieldValue(raw, 'TelephoneNumber', 'MobileNumber') || '';
    const email = this.findFieldValue(misc, 'Email', 'EmailAddress') ||
                  this.findFieldValue(raw, 'EmailAddress', 'Email') || '';

    // Address
    const address = this.findFieldValue(raw, 'AddressEnglish', 'AddressArabic') ||
      [
        this.findFieldValue(misc, 'FlatNo') ? `Flat ${this.findFieldValue(misc, 'FlatNo')}` : '',
        this.findFieldValue(misc, 'BuildingNo') ? `Bldg ${this.findFieldValue(misc, 'BuildingNo')}` : '',
        this.findFieldValue(misc, 'RoadNo') ? `Road ${this.findFieldValue(misc, 'RoadNo')}` : '',
        this.findFieldValue(misc, 'BlockNo') ? `Block ${this.findFieldValue(misc, 'BlockNo')}` : '',
        this.findFieldValue(misc, 'BlockName') || ''
      ].filter(Boolean).join(', ') || 'Kingdom of Bahrain';

    const passportNumber = this.findFieldValue(raw, 'PassportNumber', 'PassportNo') ||
                           this.findFieldValue(misc, 'PassportNo', 'PassportNumber') || '';

    // Photo Base64
    let photoBase64 = this.findFieldValue(raw, 'PhotoB64Encoded', 'Photo', 'CardPhoto', 'CPRPhoto') ||
                      this.findFieldValue(misc, 'PhotoB64Encoded', 'Photo', 'CardPhoto', 'CPRPhoto') || null;
    if (photoBase64 && !photoBase64.startsWith('data:image') && !photoBase64.startsWith('http')) {
      photoBase64 = `data:image/jpeg;base64,${photoBase64}`;
    }

    return {
      cpr_no: cpr,
      first_name: firstName,
      last_name: lastName,
      full_name_en: fullNameEn,
      full_name_ar: fullNameAr,
      dob: formattedDob,
      gender: gender,
      nationality: nationality,
      is_gcc_citizen: isGccCitizen,
      blood_group: this.findFieldValue(misc, 'BloodGroup') || this.findFieldValue(raw, 'BloodGroup') || 'O+',
      phone: phone,
      email: email,
      address: address,
      passport_no: passportNumber,
      cpr_expiry: formattedExpiry,
      profile_photo: photoBase64,
      source: 'CARD_READER',
      read_timestamp: new Date().toISOString()
    };
  }

  // Realistic Simulation Presets for testing without physical card reader hardware
  simulateCardRead(presetIndex = 0) {
    const mockCards = [
      {
        cpr_no: '910814992',
        first_name: 'Abdulla',
        last_name: 'Al-Doseri',
        full_name_en: 'Abdulla Ebrahim Al-Doseri',
        full_name_ar: 'عبدالله إبراهيم الدوسري',
        dob: '1991-08-14',
        gender: 'Male',
        nationality: 'Bahraini',
        is_gcc_citizen: 1,
        blood_group: 'A+',
        phone: '+973 3944 5566',
        email: 'a.doseri@company.bh',
        address: 'Villa 52, Road 1402, Block 214, Muharraq',
        passport_no: 'BH8492019',
        cpr_expiry: '2029-08-14',
        profile_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
        source: 'SIMULATOR'
      },
      {
        cpr_no: '870422119',
        first_name: 'Maryam',
        last_name: 'Al-Ghatam',
        full_name_en: 'Maryam Jasim Al-Ghatam',
        full_name_ar: 'مريم جاسم الغتم',
        dob: '1987-04-22',
        gender: 'Female',
        nationality: 'Bahraini',
        is_gcc_citizen: 1,
        blood_group: 'B+',
        phone: '+973 3611 7788',
        email: 'maryam.ghatam@company.bh',
        address: 'Apartment 4B, Tower 2, Seef District, Manama',
        passport_no: 'BH9182341',
        cpr_expiry: '2028-04-22',
        profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        source: 'SIMULATOR'
      },
      {
        cpr_no: '940608553',
        first_name: 'Vikram',
        last_name: 'Pillai',
        full_name_en: 'Vikram Suresh Pillai',
        full_name_ar: 'فيكرام سوريش بيلاي',
        dob: '1994-06-08',
        gender: 'Male',
        nationality: 'Indian',
        is_gcc_citizen: 0,
        blood_group: 'O+',
        phone: '+973 3499 1122',
        email: 'vikram.pillai@company.bh',
        address: 'Building 182, Flat 101, Road 2803, Adliya, Manama',
        passport_no: 'Z4928104',
        cpr_expiry: '2027-11-20',
        profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        source: 'SIMULATOR'
      },
      {
        cpr_no: '891230441',
        first_name: 'Sultan',
        last_name: 'Al-Otaibi',
        full_name_en: 'Sultan Fahad Al-Otaibi',
        full_name_ar: 'سلطان فهد العتيبي',
        dob: '1989-12-30',
        gender: 'Male',
        nationality: 'Saudi',
        is_gcc_citizen: 1,
        blood_group: 'AB+',
        phone: '+966 55 123 4567',
        email: 'sultan.otaibi@company.bh',
        address: 'Khobar Plaza, Saudi Arabia (Commuter to Bahrain)',
        passport_no: 'SA7728190',
        cpr_expiry: '2030-12-30',
        profile_photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
        source: 'SIMULATOR'
      }
    ];

    const card = mockCards[presetIndex % mockCards.length];
    return new Promise((resolve) => {
      this.isReading = true;
      this.emit('readingStart');
      setTimeout(() => {
        this.isReading = false;
        this.emit('readSuccess', card);
        resolve(card);
      }, 900);
    });
  }
}

export const smartCardService = new SmartCardReaderService();
