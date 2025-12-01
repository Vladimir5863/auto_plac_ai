import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, authApi, UserLogin, UserRegister } from '@/services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: UserLogin) => Promise<User>
  register: (userData: UserRegister) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Checking for stored token...')
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('authToken')
    console.log('Stored token:', storedToken ? 'exists' : 'not found')
    
    if (storedToken) {
      setToken(storedToken)
      console.log('Token found, fetching user data...')
      // Fetch current user data
      authApi.getCurrentUser(storedToken)
        .then(userData => {
          console.log('User data received:', userData)
          setUser(userData)
          console.log('User state updated:', userData)
        })
        .catch((error) => {
          console.error('Error fetching user data:', error)
          // Token is invalid, remove it
          localStorage.removeItem('authToken')
          setToken(null)
          console.log('Invalid token, removed from storage')
        })
        .finally(() => {
          console.log('Auth initialization complete')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials: UserLogin) => {
    try {
      console.log('AuthContext: Attempting login with credentials:', credentials.email);
      
      // 1. First, get the token
      const tokenResponse = await authApi.login(credentials);
      console.log('AuthContext: Login token response:', tokenResponse);
      
      if (!tokenResponse?.access_token) {
        throw new Error('No access token received');
      }
      
      const token = tokenResponse.access_token;
      console.log('AuthContext: Token received, fetching user data...');
      
      // 2. Then get the user data using the token
      const userData = await authApi.getCurrentUser(token);
      console.log('AuthContext: User data received:', userData);
      
      // 3. Update state and storage
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser(userData);
      
      console.log('AuthContext: Login successful, user data:', userData);
      
      // 4. Force a page reload to ensure all components update with the new auth state
      console.log('AuthContext: Reloading page...');
      window.location.href = '/';
      
      return userData;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
      throw new Error(message);
    }
  }

  const register = async (userData: UserRegister) => {
    try {
      await authApi.register(userData)
      // After successful registration, automatically log the user in
      await login({
        email: userData.email,
        lozinka: userData.lozinka
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
