import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { paymentApi, Payment, carApi } from '@/services/api'
import { CalendarDays, CreditCard, Filter, ArrowRight } from 'lucide-react'

const paymentTypeLabels: Record<string, string> = {
  featured_ad: 'Istaknuti oglas',
  kupovina: 'Kupovina vozila'
}

const MyPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [adToVehicle, setAdToVehicle] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    tip: ''
  })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentApi.myPayments({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        tip: filters.tip || undefined
      })
      setPayments(data)

      const uniqueAdIds = Array.from(
        new Set(
          data
            .map((payment) => payment.toOglasID)
            .filter((id): id is number => Boolean(id))
        )
      )

      if (uniqueAdIds.length > 0) {
        const mappings: Record<number, number> = {}
        await Promise.all(
          uniqueAdIds.map(async (oglasId) => {
            try {
              const adDetail = await carApi.getByAdId(oglasId)
              mappings[oglasId] = adDetail.vozilo.voziloID
            } catch (err) {
              console.warn(`Failed to fetch ad detail for oglas ${oglasId}:`, err)
            }
          })
        )
        setAdToVehicle(mappings)
      } else {
        setAdToVehicle({})
      }
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom učitavanja uplata.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, payment) => sum + payment.iznos, 0)
  }, [payments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchPayments()
  }

  const handleReset = () => {
    setFilters({ start_date: '', end_date: '', tip: '' })
    setPayments([])
    fetchPayments()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moje uplate</h1>
            <p className="text-gray-600 mt-2">Pregled svih uplata koje ste izvršili preko platforme.</p>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Ukupan iznos</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-500" />
            Filteri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Datum od
              </label>
              <input
                type="date"
                id="start_date"
                value={filters.start_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                Datum do
              </label>
              <input
                type="date"
                id="end_date"
                value={filters.end_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="tip" className="block text-sm font-medium text-gray-700 mb-1">
                Tip uplate
              </label>
              <select
                id="tip"
                value={filters.tip}
                onChange={(e) => setFilters((prev) => ({ ...prev, tip: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Sve uplate</option>
                <option value="featured_ad">Istaknuti oglas</option>
                <option value="kupovina">Kupovina vozila</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Primeni filtere
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Resetuj
              </button>
            </div>
          </div>
        </form>

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
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trenutno nemate evidentirane uplate</h2>
            <p className="text-gray-600">Dodajte oglas ili kupite vozilo da biste videli uplate.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iznos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vezani oglas</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.uplataID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        {new Date(payment.datumUplate).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {paymentTypeLabels[payment.tip] || payment.tip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.iznos.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.toOglasID && adToVehicle[payment.toOglasID] ? (
                          <Link
                            to={`/cars/${adToVehicle[payment.toOglasID]}`}
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Detalji vozila
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : payment.toOglasID ? (
                          <span className="text-gray-500">Oglas #{payment.toOglasID}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPayments
