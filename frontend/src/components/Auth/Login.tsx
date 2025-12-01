import { useState } from 'react'
// useNavigate is not used, removed to clean up the code
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/AuthContext'
import { UserLogin } from '@/services/api'

interface LoginProps {
  onSwitchToRegister: () => void
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState<UserLogin>({
    email: '',
    lozinka: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setError('');
    
    if (!credentials.email || !credentials.lozinka) {
      const errorMsg = 'Molimo unesite email i lozinku';
      console.log('Validation error:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    setLoading(true);
    console.log('Attempting login with email:', credentials.email);
    console.log('Login function:', login);

    try {
      console.log('Calling login function...');
      await login(credentials);
      console.log('Login function completed successfully');
      
    } catch (error) {
      console.error('Login error details:', {
        error,
        errorString: String(error),
        errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      const errorMessage = error instanceof Error ? error.message : 'Došlo je do greške prilikom prijave';
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Ulogujte se
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ili{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              kreirajte novi nalog
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email adresa
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="vas@email.com"
              />
            </div>
            <div>
              <label htmlFor="lozinka" className="block text-sm font-medium text-gray-700">
                Lozinka
              </label>
              <div className="mt-1 relative">
                <input
                  id="lozinka"
                  name="lozinka"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.lozinka}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Vaša lozinka"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                'Prijavljivanje...'
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Prijavi se
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
