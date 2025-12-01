import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Car, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/AuthContext'
import Auth from '@/components/Auth/Auth'

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout, loading } = useAuth()

  // Debug log when user changes
  useEffect(() => {
    console.log('=== HEADER: Auth State Changed ===')
    console.log('Loading:', loading)
    console.log('User:', user)
    console.log('User role:', user?.tipKorisnika)
    console.log('Is admin:', user?.tipKorisnika?.toLowerCase() === 'admin')
    console.log('===============================')
  }, [user, loading])

  // Debug log to check user object and admin status
  useEffect(() => {
    if (user) {
      console.log('=== USER INFO ===')
      console.log('User object:', user)
      console.log('User type:', user.tipKorisnika)
      console.log('Is admin:', user.tipKorisnika?.toLowerCase() === 'admin')
      console.log('User ID:', user.id)
      console.log('Email:', user.email)
      console.log('Role:', user.tipKorisnika)
      console.log('Permissions:', {
        canAccessAdmin: user.tipKorisnika?.toLowerCase() === 'admin',
        isAuthenticated: true
      })
      console.log('=================')
    } else {
      console.log('=== NO USER LOGGED IN ===')
    }
  }, [user])

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AutoPlac AI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Početna
              </Link>
              <Link
                to="/cars"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Vozila
              </Link>
              {user && (
                <>
                  <Link
                    to="/my-ads"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Moji oglasi
                  </Link>
                  <Link
                    to="/my-sold-ads"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Moja prodaja
                  </Link>
                  <Link
                    to="/my-payments"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Moje uplate
                  </Link>
                </>
              )}
              {(user?.tipKorisnika?.toLowerCase() === 'admin') && (
                <>
                  <Link
                    to="/users"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Korisnici
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin Panel
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/cars/new" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dodaj oglas
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                    >
                      <span className="text-sm font-medium">{user.korisnickoIme}</span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user.korisnickoIme}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400 capitalize">{user.tipKorisnika}</p>
                        </div>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Podešavanja
                        </button>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Odloguj se
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Uloguj se
                </button>
              )}
                {/* Mobile menu button */}
                <div className="md:hidden ml-4">
                  <button className="text-gray-500 hover:text-gray-900 p-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Dobrodošli</h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Auth />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
