import { useNavigate } from 'react-router-dom'
import VehicleCatalog from '@/components/VehicleCatalog'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Dobrodošli na
              <span className="block text-yellow-300">Auto Plać AI</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Vaš pouzdan partner u kupovini i prodaji vozila
            </p>

          </div>
        </div>
      </section>


      {/* Cars List Section */}
      <section className="py-12 bg-white">
        <VehicleCatalog
          title="Aktuelna ponuda vozila"
          subtitle="Pregledajte našu najnoviju ponudu"
          showAddButton={false}
          itemsPerPage={9}
          className="mt-0"
          showFilters={false}
          showResultsCount={false}
        />
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Želite da prodate svoje vozilo?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Objavite svoj oglas besplatno i pronađite kupca u najkraćem roku
          </p>
          <button 
            onClick={() => navigate('/cars/new')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Postavite oglas besplatno
          </button>
        </div>
      </section>
    </div>
  )
}

export default Home
