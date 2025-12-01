import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { oglasApi, MyAd } from '@/services/api'
import { MapPin, CalendarDays, Clock, Star } from 'lucide-react'

const MyAds = () => {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMyAds = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await oglasApi.getMyActive()
        setAds(data)
      } catch (err) {
        console.error('Error fetching my ads:', err)
        setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom učitavanja oglasa')
      } finally {
        setLoading(false)
      }
    }

    fetchMyAds()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const toImageUrl = (raw: string): string => {
    if (!raw) return ''
    let p = String(raw)
      .replace(/^\[?"']?|["']?\]?$/g, '')
      .trim()
    p = p.replace(/^\/+/, '/').replace(/\s+/g, ' ').trim()

    if (!p) return ''
    if (p.startsWith('http://') || p.startsWith('https://')) return p
    if (p.startsWith('/images/')) return p
    if (p.startsWith('images/')) return `/${p}`
    if (p.startsWith('/uploads/')) return `http://localhost:8000${p}`
    if (p.startsWith('uploads/')) return `http://localhost:8000/${p}`
    return `http://localhost:8000/uploads/${p.replace(/^\//, '')}`
  }

  const getFirstImageUrl = (imageData: string | string[] | null): string => {
    if (!imageData) return ''
    if (Array.isArray(imageData)) {
      return toImageUrl(imageData[0] || '')
    }

    try {
      const parsed = JSON.parse(imageData)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return toImageUrl(parsed[0])
      }
      return toImageUrl(parsed)
    } catch {
      const first = imageData.split(',')[0]?.trim() || ''
      return toImageUrl(first)
    }
  }

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )
    }

    if (ads.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trenutno nemate aktivne oglase</h2>
          <p className="text-gray-600 mb-6">Dodajte novo vozilo kako biste ga prikazali potencijalnim kupcima.</p>
          <button
            onClick={() => navigate('/cars/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Dodaj vozilo
          </button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ads.map(({ oglas, vozilo }) => {
          const imageUrl = getFirstImageUrl(vozilo.slike || '')
          const isFeatured = oglas.statusOglasa === 'istaknutiOglas'
          const expiresDate = oglas.datumIsteka ? new Date(oglas.datumIsteka) : null

          return (
            <div key={oglas.oglasID} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-56 bg-gray-100 relative">
                <img
                  src={imageUrl || '/placeholder-car.jpg'}
                  alt={`${vozilo.marka} ${vozilo.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = '/placeholder-car.jpg'
                  }}
                />
                {isFeatured && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                    <Star className="h-4 w-4" /> Istaknuti oglas
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{vozilo.marka} {vozilo.model}</h3>
                    <p className="text-gray-500 text-sm">{vozilo.godinaProizvodnje} • {vozilo.kilometraza} km</p>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{formatPrice(vozilo.cena)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>{vozilo.lokacija}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    <span>Aktivan do: {expiresDate ? expiresDate.toLocaleDateString('sr-RS') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span>Status: {oglas.statusOglasa === 'istaknutiOglas' ? 'Istaknut' : 'Aktivan'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tip goriva:</span>
                    <span>{vozilo.tipGoriva}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/cars/${vozilo.voziloID}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Pogledaj detalje vozila
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }, [ads, error, loading, navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moji oglasi</h1>
          <p className="text-gray-600 mt-2">Pregledajte sve svoje trenutno aktivne oglase.</p>
        </div>

        {content}
      </div>
    </div>
  )
}

export default MyAds
