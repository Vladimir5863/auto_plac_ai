import { useEffect, useMemo, useState } from 'react'
import { adminApi, Payment, RevenueSummary, ReportSummary, User } from '@/services/api'
import { Users, CreditCard, BarChart, Trash2, User as UserIcon, UserX } from 'lucide-react'

interface PaymentFilters {
  start_date: string
  end_date: string
  tip: string
}

interface UserFilters {
  showDeleted: boolean
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null)
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PaymentFilters>({ start_date: '', end_date: '', tip: '' })
  const [userFilters, setUserFilters] = useState<UserFilters>({ showDeleted: false })

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersData, paymentsData, revenueData, reportsData] = await Promise.all([
        adminApi.listUsers(0, 100, userFilters.showDeleted),
        adminApi.listPayments({
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
          tip: filters.tip || undefined
        }),
        adminApi.revenueSummary({
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined
        }),
        adminApi.reports({
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
          tip: filters.tip || undefined
        })
      ])

      setUsers(usersData)
      setPayments(paymentsData)
      setRevenue(revenueData)
      setReports(reportsData)
    } catch (err) {
      console.error('Error loading admin data:', err)
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom učitavanja podataka.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchAll()
  }

  const handleReset = async () => {
    setFilters({ start_date: '', end_date: '', tip: '' })
    setUserFilters({ showDeleted: false })
    await fetchAll()
  }

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
      try {
        // Mark user as deleted in the UI immediately for better UX
        setUsers(users.map(u => u.id === userId ? { ...u, deleted_at: new Date().toISOString() } : u))
        // Call the API to soft delete the user
        await adminApi.updateUser(userId, { is_deleted: true })
        // Refresh the list to ensure consistency
        await fetchAll()
      } catch (err) {
        console.error('Error deleting user:', err)
        setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom brisanja korisnika.')
      }
    }
  }

  const totalTransactions = payments.length
  const totalAmount = useMemo(() => payments.reduce((sum, payment) => sum + payment.iznos, 0), [payments])

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Pregled korisnika, uplata i prihoda platforme.</p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Korisnika</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Uplata</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTransactions}</p>
              <p className="text-sm text-gray-500">{totalAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
              <BarChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit od isticanja</p>
              <p className="text-2xl font-semibold text-gray-900">
                {revenue ? revenue.total_featured_revenue.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' }) : '--'}
              </p>
              <p className="text-sm text-gray-500">Istaknutih: {revenue?.total_featured_count ?? '--'}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Filter uplata</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum od</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datum do</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tip uplate</label>
              <select
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
                Primeni
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Resetuj
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Uplate</h2>
            <span className="text-sm text-gray-500">{payments.length} zapisa</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iznos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Od korisnika</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ka korisniku</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID oglasa</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.uplataID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(payment.datumUplate).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.tip === 'featured_ad' ? 'Istaknuti oglas' : 'Kupovina vozila'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.iznos.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.fromUserID ?? '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.toUserID ?? '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                        {payment.toOglasID ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Izveštaji</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div key={report.tip} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase">{report.tip === 'featured_ad' ? 'Istaknuti oglasi' : 'Kupovine vozila'}</h3>
                <p className="#text-2xl font-semibold text-gray-900 mt-2">{report.total_count} transakcija</p>
                <p className="text-sm text-gray-600">Ukupan iznos: {report.total_amount.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' })}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Korisnici</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="show-deleted"
                  type="checkbox"
                  checked={userFilters.showDeleted}
                  onChange={(e) => {
                    setUserFilters(prev => ({ ...prev, showDeleted: e.target.checked }))
                    fetchAll()
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="show-deleted" className="ml-2 block text-sm text-gray-700">
                  Prikaži obrisane korisnike
                </label>
              </div>
              <span className="text-sm text-gray-500">{users.length} korisnika</span>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nema dostupnih korisnika.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Korisničko ime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcije</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={user.deleted_at ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {user.deleted_at ? (
                            <UserX className="h-5 w-5 text-red-500 mr-2" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          {user.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {user.korisnickoIme}
                        {user.deleted_at && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Obrisan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.tipKorisnika === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.tipKorisnika}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.brojTelefona ?? '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!user.deleted_at && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Obriši korisnika"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
