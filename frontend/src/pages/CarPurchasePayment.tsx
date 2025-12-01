import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CarAdStatus, carApi, Car } from '@/services/api'

const CarPurchasePayment = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cardNumber, setCardNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [car, setCar] = useState<Car | null>(null)
  const [adStatus, setAdStatus] = useState<CarAdStatus | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const carId = Number(id)
        const [carData, statusData] = await Promise.all([
          carApi.getById(carId),
          carApi.getAdStatus(carId).catch(() => null)
        ])
        setCar(carData)
        setAdStatus(statusData)
      } catch (err) {
        console.error('Error preparing purchase:', err)
        setError('Došlo je do greške pri učitavanju podataka o vozilu.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCardChange = (value: string) => {
    const formattedValue = value
      .replace(/\s/g, '')
      .match(/.{1,4}/g)
      ?.join(' ')
      .substring(0, 19) || ''

    setCardNumber(formattedValue)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Broj kartice mora imati 16 cifara.')
      return
    }

    if (!adStatus?.ad_id) {
      setError('Oglas nije pronađen ili nije aktivan.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await carApi.purchase(adStatus.ad_id)
      navigate(`/cars/${id}?purchase=success`, { replace: true })
    } catch (err) {
      console.error('Error completing purchase:', err)
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom kupovine vozila.')
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = car?.cena ?? 0

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Kupovina vozila</h1>
            {car && (
              <p className="mt-2 text-gray-600">
                {car.marka} {car.model} · {car.godinaProizvodnje}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-blue-400 font-bold text-xl">ℹ️</div>
              <div className="ml-3 text-sm text-blue-800">
                <p>Transakcija se obavlja preko našeg sistema bezbednog plaćanja.</p>
                <p>Vaši podaci o kartici nisu trajno sačuvani.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Vozilo</span>
              <span>{car ? `${car.marka} ${car.model}` : '—'}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Cena vozila</span>
              <span>{totalPrice.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Ukupno za uplatu</span>
              <span className="text-lg font-bold text-green-600">
                {totalPrice.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Broj kartice
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(event) => handleCardChange(event.target.value)}
                placeholder="1234 5678 9012 3456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center text-lg font-mono tracking-wider"
                required
              />
              <p className="mt-2 text-sm text-gray-500">Unesite broj kartice sa 16 cifara.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Obrada kupovine...' : 'Potvrdi kupovinu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CarPurchasePayment
