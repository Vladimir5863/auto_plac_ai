import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { oglasApi, MyAd } from '@/services/api'
import { ArrowRight, CarFront, CalendarDays, MapPin, Shield } from 'lucide-react'

const statusLabel = (status: string) => {
  switch (status) {
    case 'prodat':
      return 'Prodat'
    case 'istaknutiOglas':
      return 'Istaknut'
    default:
      return 'Aktivan'
  }
}

const MySoldAds = () => {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchAds = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await oglasApi.getMySoldAds()
      setAds(data)
    } catch (err) {
      console.error('Error fetching sold ads:', err)
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom učitavanja prodatih oglasa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const totalRevenue = useMemo(() => {
    return ads.reduce((sum, item) => sum + (item.vozilo?.cena ?? 0), 0)
  }, [ads])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moji prodati oglasi</h1>
            <p className="text-gray-600 mt-2">Pregled svih oglasa koji su uspešno prodati.</p>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <CarFront className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Ukupna prodajna vrednost</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalRevenue.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">🚙</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Još nema prodatih oglasa</h2>
            <p className="text-gray-600">Kada prodate vozilo, oglasi će se pojaviti ovde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ads.map(({ oglas, vozilo }) => (
              <div key={oglas.oglasID} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {vozilo?.marka} {vozilo?.model}
                      </h3>
                      <p className="text-sm text-gray-500">{vozilo?.godinaProizvodnje} • {vozilo?.kilometraza} km</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      {statusLabel(oglas.statusOglasa)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      <span>{vozilo?.lokacija}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-indigo-500" />
                      <span>Prodato: {oglas.datumProdaje ? new Date(oglas.datumProdaje).toLocaleDateString('sr-RS') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      <span>Cena: {vozilo?.cena?.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/cars/${vozilo?.voziloID}`)}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Pogledaj detalje
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MySoldAds
