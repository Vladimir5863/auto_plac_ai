import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Fuel, Star } from 'lucide-react';
import { carApi, Car } from '@/services/api';

export default function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        setLoading(true);
        // In a real app, you would have an endpoint to fetch only featured cars
        const allCars = await carApi.getAll();
        const carsWithStatus = await Promise.all(
          allCars.map(async (car: Car) => {
            try {
              const adStatus = await carApi.getAdStatus(car.voziloID);
              return { ...car, isFeatured: adStatus?.statusOglasa === 'istaknutiOglas' };
            } catch (error) {
              console.error('Error fetching ad status for car:', car.voziloID, error);
              return { ...car, isFeatured: false };
            }
          })
        );
        
        const featured = carsWithStatus.filter(car => car.isFeatured);
        setFeaturedCars(featured);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="block">Istaknuti oglasi</span>
            <span className="block text-primary-600 text-xl mt-2">Pregledajte posebno istaknute automobile</span>
          </h1>
        </div>

        {featuredCars.length === 0 ? (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nema istaknutih oglasa</h3>
            <p className="mt-1 text-sm text-gray-500">Trenutno nema oglasa sa istaknutim statusom.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/cars')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Vidi sve oglase
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredCars.map((car) => (
              <div 
                key={car.voziloID} 
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 border-2 border-yellow-200"
              >
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover"
                    src={car.slike ? car.slike.split(',')[0] : 'https://via.placeholder.com/300x200?text=Nema+slike'}
                    alt={`${car.marka} ${car.model}`}
                  />
                  <div className="absolute top-2 left-2">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-500" />
                      Istaknuto
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{car.marka} {car.model}</h3>
                      <p className="text-sm text-gray-500">{car.godinaProizvodnje} • {car.kilometraza} km</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {formatPrice(car.cena)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {car.lokacija}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Fuel className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    {car.tipGoriva}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/cars/${car.voziloID}`)}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Pogledaj detalje
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
