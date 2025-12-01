const API_BASE_URL = 'http://localhost:8000'

export interface Car {
  voziloID: number
  marka: string
  model: string
  godinaProizvodnje: number
  cena: number
  tipGoriva: string
  kilometraza: string
  lokacija: string
  slike: string | string[] | null
  stanje: string
  kubikaza: number
  opis: string
  tipKaroserije: string
  snagaMotoraKW: number
  klima: string
  tipMenjaca: string
  ostecenje: boolean
  euroNorma: string
  istaknuto: boolean
  isFeatured?: boolean
  oglasID?: number
  statusOglasa?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

const buildAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('Niste prijavljeni. Molimo prijavite se.')
  }

  return {
    'Authorization': `Bearer ${token}`
  }
}

export const adminApi = {
  listUsers: async (skip = 0, limit = 100): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users?skip=${skip}&limit=${limit}`, {
      headers: buildAuthHeaders()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje korisnika')
    }
    return response.json()
  },

  listPayments: async (params: { start_date?: string; end_date?: string; tip?: string } = {}): Promise<Payment[]> => {
    const url = new URL(`${API_BASE_URL}/admin/payments`)
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje uplata')
    }
    return response.json()
  },

  revenueSummary: async (params: { start_date?: string; end_date?: string } = {}): Promise<RevenueSummary> => {
    const url = new URL(`${API_BASE_URL}/admin/revenue`)
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje prihoda')
    }
    return response.json()
  },

  reports: async (params: { start_date?: string; end_date?: string; tip?: string } = {}): Promise<ReportSummary[]> => {
    const url = new URL(`${API_BASE_URL}/admin/reports`)
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje izveštaja')
    }
    return response.json()
  }
}

export const paymentApi = {
  myPayments: async (params: { start_date?: string; end_date?: string; tip?: string } = {}): Promise<Payment[]> => {
    const url = new URL(`${API_BASE_URL}/payments/my`)
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: buildAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje uplata korisnika')
    }

    return response.json()
  }
}

export interface MyAd {
  oglas: Oglas
  vozilo: Car
}

export interface CarAdStatus {
  has_active_ad: boolean
  status: string
  expiration_date: string | null
  is_featured: boolean
  is_sold: boolean
  buyer_id: number | null
  ad_id: number
  sale_date: string | null
  seller_id: number | null
}

export interface Payment {
  uplataID: number
  fromUserID: number | null
  toUserID: number | null
  toOglasID: number | null
  datumUplate: string
  iznos: number
  tip: string
  created_at?: string
  updated_at?: string
}

export interface RevenueSummary {
  total_featured_revenue: number
  total_featured_count: number
  total_purchase_volume: number
  total_purchase_count: number
}

export interface ReportSummary {
  tip: string
  total_count: number
  total_amount: number
}

export interface User {
  id: number
  korisnickoIme: string
  email: string
  brojTelefona: string
  tipKorisnika: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export interface Oglas {
  oglasID: number
  datumKreiranja: string
  datumIsteka: string
  cenaIstaknutogOglasa?: number
  voziloID: number
  korisnikID: number
  buyerID?: number | null
  statusOglasa: string
  datumProdaje?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

// API functions for Cars
export const carApi = {
  // Get all cars
  getAll: async (skip: number = 0, limit: number = 100): Promise<Car[]> => {
    const response = await fetch(`${API_BASE_URL}/vozila/?skip=${skip}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch cars')
    }
    return response.json()
  },

  // Get car by ID (alias for getById for consistency)
  getOne: async (id: number): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/vozila/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch car')
    }
    return response.json()
  },
  
  // Get car by ID
  getById: async (id: number): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/vozila/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch car')
    }
    return response.json()
  },

  // Search cars
  search: async (params: {
    marka?: string
    model?: string
    min_cena?: number
    max_cena?: number
  }): Promise<Car[]> => {
    const searchParams = new URLSearchParams()
    if (params.marka) searchParams.append('marka', params.marka)
    if (params.model) searchParams.append('model', params.model)
    if (params.min_cena) searchParams.append('min_cena', params.min_cena.toString())
    if (params.max_cena) searchParams.append('max_cena', params.max_cena.toString())

    const response = await fetch(`${API_BASE_URL}/vozila/search/?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to search cars')
    }
    return response.json()
  },

  // Create car
  create: async (car: Omit<Car, 'voziloID' | 'created_at' | 'updated_at' | 'deleted_at'> | FormData, isFormData: boolean = false): Promise<Car> => {
    // Get the token first
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found. User must be logged in to create a car.');
      throw new Error('Niste prijavljeni. Molimo prijavite se da biste dodali oglas.');
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    
    let body: BodyInit;

    if (isFormData) {
      // For FormData, let the browser set the correct content-type with boundary
      body = car as FormData;
      // Don't set Content-Type header for FormData, let the browser set it with the correct boundary
    } else {
      // For regular JSON data
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(car);
    }
    
    // Log the token for debugging (remove in production)
    console.log('Using token for request:', token.substring(0, 10) + '...');

    const response = await fetch(`${API_BASE_URL}/vozila/`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to create car:', errorData);
      throw new Error(errorData.detail || 'Failed to create car');
    }
    return response.json();
  },

  // Update car
  update: async (id: number, car: Partial<Car>): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/vozila/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(car),
    })
    if (!response.ok) {
      throw new Error('Failed to update car')
    }
    return response.json()
  },

  // Delete car
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vozila/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete car')
    }
  },

  // Get ad status for a car
  getAdStatus: async (carId: number): Promise<CarAdStatus> => {
    const response = await fetch(`${API_BASE_URL}/vozila/${carId}/ad-status`)
    if (!response.ok) {
      throw new Error('Failed to fetch ad status')
    }
    return response.json()
  },

  getByAdId: async (oglasId: number): Promise<MyAd> => {
    const headers = buildAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/oglasi/${oglasId}/detail`, {
      headers
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje oglasa')
    }
    return response.json()
  },
  
    // Get seller info for a car
  getSellerInfo: async (carId: number): Promise<User> => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/vozila/${carId}/seller`, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch seller information');
    }
    return response.json();
  },

  purchase: async (oglasId: number): Promise<Oglas> => {
    const headers = buildAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/oglasi/${oglasId}/purchase`, {
      method: 'POST',
      headers
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešna kupovina vozila')
    }
    return response.json()
  },

  getSoldDetail: async (oglasId: number): Promise<MyAd> => {
    const headers = buildAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/oglasi/${oglasId}/sold-detail`, {
      headers
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje detalja oglasa')
    }
    return response.json()
  },
  
  // Feature an ad
  featureAd: async (oglasId: number): Promise<void> => {
    const headers = buildAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/oglasi/${oglasId}/feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno istaknivanje oglasa')
    }
    
    return response.json()
  }
}

// API functions for Users
export const userApi = {
  // Get all users
  getAll: async (skip: number = 0, limit: number = 100): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users/?skip=${skip}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  },

  // Get user by ID
  getById: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }
    return response.json()
  },

  // Create user
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    if (!response.ok) {
      throw new Error('Failed to create user')
    }
    return response.json()
  },

  // Update user
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    if (!response.ok) {
      throw new Error('Failed to update user')
    }
    return response.json()
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete user')
    }
  }
}

// API functions for Oglasi (Advertisements)
export const oglasApi = {
  // Get all oglasi
  getAll: async (skip: number = 0, limit: number = 100): Promise<Oglas[]> => {
    const response = await fetch(`${API_BASE_URL}/oglasi/?skip=${skip}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch oglasi')
    }
    return response.json()
  },

  // Get active oglasi
  getActive: async (): Promise<Oglas[]> => {
    const response = await fetch(`${API_BASE_URL}/oglasi/active/`)
    if (!response.ok) {
      throw new Error('Failed to fetch active oglasi')
    }
    return response.json()
  },

  // Get oglas by ID
  getById: async (id: number): Promise<Oglas> => {
    const response = await fetch(`${API_BASE_URL}/oglasi/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch oglas')
    }
    return response.json()
  },

  getMySoldAds: async (): Promise<MyAd[]> => {
    const headers = buildAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/oglasi/my/sold`, {
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Neuspešno učitavanje prodatih oglasa')
    }

    return response.json()
  },

  // Get current user's active ads
  getMyActive: async (): Promise<MyAd[]> => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('Niste prijavljeni. Molimo prijavite se.');
    }

    const response = await fetch(`${API_BASE_URL}/oglasi/my/active`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch user ads');
    }

    return response.json();
  },

  // Create oglas
  create: async (oglas: Omit<Oglas, 'oglasID' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Oglas> => {
    const response = await fetch(`${API_BASE_URL}/oglasi/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(oglas),
    })
    if (!response.ok) {
      throw new Error('Failed to create oglas')
    }
    return response.json()
  },

  // Update oglas
  update: async (id: number, oglas: Partial<Oglas>): Promise<Oglas> => {
    const response = await fetch(`${API_BASE_URL}/oglasi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(oglas),
    })
    if (!response.ok) {
      throw new Error('Failed to update oglas')
    }
    return response.json()
  },

  // Delete oglas
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/oglasi/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete oglas')
    }
  }
}

// Auth interfaces
export interface UserLogin {
  email: string
  lozinka: string
}

export interface UserRegister {
  korisnickoIme: string
  email: string
  brojTelefona: string
  lozinka: string
  tipKorisnika: string
}

export interface Token {
  access_token: string
  token_type: string
}

// API functions for Auth
export const authApi = {
  // Login user
  login: async (credentials: UserLogin): Promise<Token> => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.email)
    formData.append('password', credentials.lozinka)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const detail =
        (typeof errorData?.detail === 'string' && errorData.detail) ||
        (Array.isArray(errorData?.detail) && errorData.detail[0]?.msg) ||
        (errorData?.message as string | undefined)
      throw new Error(detail || 'Login failed')
    }
    return response.json()
  },

  // Register user
  register: async (userData: UserRegister): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const detail =
        (typeof errorData?.detail === 'string' && errorData.detail) ||
        (Array.isArray(errorData?.detail) && errorData.detail[0]?.msg) ||
        (errorData?.message as string | undefined)
      throw new Error(detail || 'Registration failed')
    }
    return response.json()
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to get current user')
    }
    return response.json()
  }
}
