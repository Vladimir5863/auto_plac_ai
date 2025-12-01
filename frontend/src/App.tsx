import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetails from './pages/CarDetails'
import AddCar from './pages/AddCar'
import Users from './pages/Users'
import FeaturedAdPayment from './pages/FeaturedAdPayment'
import MyAds from './pages/MyAds'
import MyPayments from './pages/MyPayments'
import MySoldAds from './pages/MySoldAds'
import AdminDashboard from './pages/AdminDashboard'
import CarPurchasePayment from './pages/CarPurchasePayment'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/new" element={
              <ProtectedRoute>
                <AddCar />
              </ProtectedRoute>
            } />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/cars/:id/featured-payment" element={
              <ProtectedRoute>
                <FeaturedAdPayment />
              </ProtectedRoute>
            } />
            <Route path="/cars/:id/purchase" element={
              <ProtectedRoute>
                <CarPurchasePayment />
              </ProtectedRoute>
            } />
            <Route path="/my-ads" element={
              <ProtectedRoute>
                <MyAds />
              </ProtectedRoute>
            } />
            <Route path="/my-payments" element={
              <ProtectedRoute>
                <MyPayments />
              </ProtectedRoute>
            } />
            <Route path="/my-sold-ads" element={
              <ProtectedRoute>
                <MySoldAds />
              </ProtectedRoute>
            } />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
