import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Fuel } from 'lucide-react';
import { carApi, Car } from '@/services/api';
import { useAuth } from '@/AuthContext';
import { FeaturedBadge } from '@/components/FeaturedAd/FeaturedBadge';
import {
  CAR_BRANDS,
  BRAND_OPTIONS,
  BODY_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  EURO_NORM_OPTIONS,
  CLIMATE_FILTER_OPTIONS,
  FUEL_OPTIONS,
  STANJE_OPTIONS,
} from '@/constants/carOptions';

const createDefaultFilters = () => ({
  marka: '',
  model: '',
  minPrice: '',
  maxPrice: '',
  godinaOd: '',
  godinaDo: '',
  tipGoriva: '',
  lokacija: '',
  stanje: '',
  tipKaroserije: '',
  tipMenjaca: '',
  klima: '',
  euroNorma: '',
  ostecenje: '',
  minKubikaza: '',
  maxKubikaza: '',
  minSnaga: '',
  maxSnaga: '',
  minKilometraza: '',
  maxKilometraza: '',
});

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(createDefaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  
  const navigate = useNavigate();
  const { user } = useAuth();
  // Fetch cars from API
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const carsData = await carApi.getAll(0, 1000);

        // Sort cars: featured first (based on istaknuto/isFeatured), then by creation date (newest first)
        const sortedCars = [...carsData].sort((a, b) => {
          const aFeatured = Boolean(a.isFeatured ?? a.istaknuto ?? false);
          const bFeatured = Boolean(b.isFeatured ?? b.istaknuto ?? false);
          
          if (aFeatured && !bFeatured) return -1;
          if (!aFeatured && bFeatured) return 1;
          
          // Then by creation date (newest first)
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });

        setCars(sortedCars);
        setFilteredCars(sortedCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
        // Fallback to empty array on error
        setCars([]);
        setFilteredCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const availableModels = useMemo(() => {
    if (filters.marka) {
      const modelsFromConst = CAR_BRANDS[filters.marka];
      if (modelsFromConst?.length) {
        return modelsFromConst;
      }
      return Array.from(
        new Set(cars.filter((car) => car.marka.toLowerCase() === filters.marka.toLowerCase()).map((car) => car.model))
      ).sort();
    }

    return Array.from(new Set(cars.map((car) => car.model))).sort();
  }, [filters.marka, cars]);

  const filterCars = () => {
    const toNumber = (value: string): number | undefined => {
      if (!value) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    const parseKilometraza = (value: string | number | null | undefined): number => {
      if (value === null || value === undefined) return 0
      const str = value.toString().replace(/[^0-9]/g, '')
      return str ? Number(str) : 0
    }

    return cars.filter(car => {
      const matchesMarka = !filters.marka || car.marka.toLowerCase().includes(filters.marka.toLowerCase());
      const matchesModel = !filters.model || (car.model || '').toLowerCase().includes(filters.model.toLowerCase());
      const minPrice = toNumber(filters.minPrice);
      const maxPrice = toNumber(filters.maxPrice);
      const matchesMinPrice = minPrice === undefined || car.cena >= minPrice;
      const matchesMaxPrice = maxPrice === undefined || car.cena <= maxPrice;
      const minYear = toNumber(filters.godinaOd);
      const maxYear = toNumber(filters.godinaDo);
      const matchesYearFrom = minYear === undefined || car.godinaProizvodnje >= minYear;
      const matchesYearTo = maxYear === undefined || car.godinaProizvodnje <= maxYear;
      const matchesTipGoriva = !filters.tipGoriva || car.tipGoriva.toLowerCase() === filters.tipGoriva.toLowerCase();
      const matchesLokacija = !filters.lokacija || car.lokacija.toLowerCase().includes(filters.lokacija.toLowerCase());
      const matchesStanje = !filters.stanje || car.stanje.toLowerCase() === filters.stanje.toLowerCase();
      const matchesKaroserija = !filters.tipKaroserije || car.tipKaroserije.toLowerCase() === filters.tipKaroserije.toLowerCase();
      const matchesMenjac = !filters.tipMenjaca || car.tipMenjaca.toLowerCase() === filters.tipMenjaca.toLowerCase();
      const matchesKlima = !filters.klima ||
        (filters.klima === 'ima'
          ? !/bez/i.test(car.klima)
          : /bez/i.test(car.klima));
      const matchesEuro = !filters.euroNorma || car.euroNorma.toLowerCase() === filters.euroNorma.toLowerCase();

      const minKubikaza = toNumber(filters.minKubikaza);
      const maxKubikaza = toNumber(filters.maxKubikaza);
      const matchesMinKubikaza = minKubikaza === undefined || car.kubikaza >= minKubikaza;
      const matchesMaxKubikaza = maxKubikaza === undefined || car.kubikaza <= maxKubikaza;

      const minSnaga = toNumber(filters.minSnaga);
      const maxSnaga = toNumber(filters.maxSnaga);
      const matchesMinSnaga = minSnaga === undefined || car.snagaMotoraKW >= minSnaga;
      const matchesMaxSnaga = maxSnaga === undefined || car.snagaMotoraKW <= maxSnaga;

      const carKilometraza = parseKilometraza(car.kilometraza);
      const minKilometraza = toNumber(filters.minKilometraza);
      const maxKilometraza = toNumber(filters.maxKilometraza);
      const matchesMinKilometraza = minKilometraza === undefined || carKilometraza >= minKilometraza;
      const matchesMaxKilometraza = maxKilometraza === undefined || (maxKilometraza === 0 ? true : carKilometraza <= maxKilometraza);

      const matchesOstecenje = !filters.ostecenje ||
        (filters.ostecenje === 'true' ? car.ostecenje : !car.ostecenje);

      return matchesMarka &&
        matchesModel &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesYearFrom &&
        matchesYearTo &&
        matchesTipGoriva &&
        matchesLokacija &&
        matchesStanje &&
        matchesKaroserija &&
        matchesMenjac &&
        matchesKlima &&
        matchesEuro &&
        matchesMinKubikaza &&
        matchesMaxKubikaza &&
        matchesMinSnaga &&
        matchesMaxSnaga &&
        matchesMinKilometraza &&
        matchesMaxKilometraza &&
        matchesOstecenje;
    });
  };

  useEffect(() => {
    setFilteredCars(filterCars())
    setCurrentPage(1)
  }, [cars, filters])

  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCars.slice(start, start + pageSize)
  }, [filteredCars, currentPage])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const resetFilters = () => {
    setFilters(createDefaultFilters())
  }

  const handleBrandChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      marka: value,
      model: '',
    }))
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Vozila</h1>
          {user && (
            <button
              onClick={() => navigate('/cars/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Dodaj vozilo
            </button>
          )}
        </div>
        <p className="text-gray-600">Pronađite svoje savršeno vozilo među našom bogatom ponudom</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Filteri</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Resetuj sve
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="marka" className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                    <select
                      id="marka"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.marka}
                      onChange={(e) => handleBrandChange(e.target.value)}
                    >
                      <option value="">Sve marke</option>
                      {BRAND_OPTIONS.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <select
                      id="model"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.model}
                      onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                      disabled={availableModels.length === 0 && !filters.marka}
                    >
                      <option value="">Svi modeli</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Cena od (€)</label>
                    <input
                      type="number"
                      id="minPrice"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Cena do (€)</label>
                    <input
                      type="number"
                      id="maxPrice"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="godinaOd" className="block text-sm font-medium text-gray-700 mb-1">God. od</label>
                    <input
                      type="number"
                      id="godinaOd"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.godinaOd}
                      onChange={(e) => setFilters({...filters, godinaOd: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="godinaDo" className="block text-sm font-medium text-gray-700 mb-1">God. do</label>
                    <input
                      type="number"
                      id="godinaDo"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.godinaDo}
                      onChange={(e) => setFilters({...filters, godinaDo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label htmlFor="tipGoriva" className="block text-sm font-medium text-gray-700 mb-1">Vrsta goriva</label>
                    <select
                      id="tipGoriva"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.tipGoriva}
                      onChange={(e) => setFilters({ ...filters, tipGoriva: e.target.value })}
                    >
                      <option value="">Sve vrste goriva</option>
                      {FUEL_OPTIONS.map((fuel) => (
                        <option key={fuel} value={fuel}>{fuel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lokacija" className="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
                    <input
                      type="text"
                      id="lokacija"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Unesite lokaciju..."
                      value={filters.lokacija}
                      onChange={(e) => setFilters({ ...filters, lokacija: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="stanje" className="block text-sm font-medium text-gray-700 mb-1">Stanje</label>
                    <select
                      id="stanje"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.stanje}
                      onChange={(e) => setFilters({ ...filters, stanje: e.target.value })}
                    >
                      <option value="">Sva stanja</option>
                      {STANJE_OPTIONS.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tipKaroserije" className="block text-sm font-medium text-gray-700 mb-1">Tip karoserije</label>
                    <select
                      id="tipKaroserije"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.tipKaroserije}
                      onChange={(e) => setFilters({ ...filters, tipKaroserije: e.target.value })}
                    >
                      <option value="">Sve karoserije</option>
                      {BODY_TYPE_OPTIONS.map((body) => (
                        <option key={body} value={body}>{body}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="tipMenjaca" className="block text-sm font-medium text-gray-700 mb-1">Menjač</label>
                    <select
                      id="tipMenjaca"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.tipMenjaca}
                      onChange={(e) => setFilters({ ...filters, tipMenjaca: e.target.value })}
                    >
                      <option value="">Svi menjači</option>
                      {TRANSMISSION_OPTIONS.map((gear) => (
                        <option key={gear} value={gear}>{gear}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="klima" className="block text-sm font-medium text-gray-700 mb-1">Klima</label>
                    <select
                      id="klima"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.klima}
                      onChange={(e) => setFilters({ ...filters, klima: e.target.value })}
                    >
                      {CLIMATE_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="euroNorma" className="block text-sm font-medium text-gray-700 mb-1">Euro norma</label>
                    <select
                      id="euroNorma"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.euroNorma}
                      onChange={(e) => setFilters({ ...filters, euroNorma: e.target.value })}
                    >
                      <option value="">Sve norme</option>
                      {EURO_NORM_OPTIONS.map((norm) => (
                        <option key={norm} value={norm}>{norm}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ostecenje" className="block text-sm font-medium text-gray-700 mb-1">Oštećenje</label>
                    <select
                      id="ostecenje"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.ostecenje}
                      onChange={(e) => setFilters({ ...filters, ostecenje: e.target.value })}
                    >
                      <option value="">Sve ponude</option>
                      <option value="false">Bez oštećenja</option>
                      <option value="true">Sa oštećenjem</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minKubikaza" className="block text-sm font-medium text-gray-700 mb-1">Kubikaža od</label>
                    <input
                      type="number"
                      id="minKubikaza"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.minKubikaza}
                      onChange={(e) => setFilters({ ...filters, minKubikaza: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxKubikaza" className="block text-sm font-medium text-gray-700 mb-1">Kubikaža do</label>
                    <input
                      type="number"
                      id="maxKubikaza"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.maxKubikaza}
                      onChange={(e) => setFilters({ ...filters, maxKubikaza: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minSnaga" className="block text-sm font-medium text-gray-700 mb-1">Snaga od (kW)</label>
                    <input
                      type="number"
                      id="minSnaga"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.minSnaga}
                      onChange={(e) => setFilters({ ...filters, minSnaga: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxSnaga" className="block text-sm font-medium text-gray-700 mb-1">Snaga do (kW)</label>
                    <input
                      type="number"
                      id="maxSnaga"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.maxSnaga}
                      onChange={(e) => setFilters({ ...filters, maxSnaga: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minKilometraza" className="block text-sm font-medium text-gray-700 mb-1">Kilometraža od</label>
                    <input
                      type="number"
                      id="minKilometraza"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.minKilometraza}
                      onChange={(e) => setFilters({ ...filters, minKilometraza: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxKilometraza" className="block text-sm font-medium text-gray-700 mb-1">Kilometraža do</label>
                    <input
                      type="number"
                      id="maxKilometraza"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={filters.maxKilometraza}
                      onChange={(e) => setFilters({ ...filters, maxKilometraza: e.target.value })}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                Pronađeno {filteredCars.length} vozila
              </p>
            </div>

            {/* Cars Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedCars.map((car) => {
                  const toImageUrl = (raw: string): string => {
                    if (!raw) return '';
                    let p = String(raw)
                      .replace(/^\[?"']?|["']?\]?$/g, '')
                      .trim();
                    p = p.replace(/^\/+/, '/').replace(/\s+/g, ' ').trim();

                    if (!p) return '';
                    if (p.startsWith('http://') || p.startsWith('https://')) return p;
                    if (p.startsWith('/images/')) return p;
                    if (p.startsWith('images/')) return `/${p}`;
                    if (p.startsWith('/uploads/')) return `http://localhost:8000${p}`;
                    if (p.startsWith('uploads/')) return `http://localhost:8000/${p}`;
                    return `http://localhost:8000/uploads/${p.replace(/^\//, '')}`;
                  };

                  const getFirstImageUrl = (imageData: string | string[] | null): string => {
                    if (!imageData) return '';
                    if (Array.isArray(imageData)) {
                      return toImageUrl(imageData[0] || '');
                    }
                    try {
                      const parsed = JSON.parse(imageData);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        return toImageUrl(parsed[0]);
                      }
                      return toImageUrl(parsed);
                    } catch {
                      const first = imageData.split(',')[0]?.trim() || '';
                      return toImageUrl(first);
                    }
                  };

                  const imageUrl = getFirstImageUrl(car.slike || '');
                  const isFeatured = car.isFeatured ?? false;

                  return (
                    <div key={car.voziloID} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                      <div className="relative h-48">
                        <img
                          className="w-full h-full object-cover"
                          src={imageUrl || '/placeholder-car.jpg'}
                          alt={`${car.marka} ${car.model}`}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = '/placeholder-car.jpg';
                          }}
                        />
                        {isFeatured && (
                          <div className="absolute top-2 left-2">
                            <FeaturedBadge />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{car.marka} {car.model}</h3>
                            <p className="text-sm text-gray-500">{car.godinaProizvodnje} • {car.kilometraza} km</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                              {formatPrice(car.cena)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Fuel className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" />
                            {car.tipGoriva}
                          </div>
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {car.tipMenjaca}
                          </div>
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {car.snagaMotoraKW} kW
                          </div>
                          <div className="flex items-center">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" />
                            {car.lokacija}
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            onClick={() => navigate(`/cars/${car.voziloID}`)}
                            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          >
                            Pogledaj detalje
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nema pronađenih vozila</h3>
                <p className="mt-1 text-sm text-gray-500">Pokušajte da izmenite filtere za više rezultata.</p>
                <div className="mt-6">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resetuj filtere
                  </button>
                </div>
              </div>
            )}

            {filteredCars.length > pageSize && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prethodna
                </button>
                <span className="text-sm text-gray-600">
                  Strana {currentPage} / {Math.ceil(filteredCars.length / pageSize)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage * pageSize < filteredCars.length ? currentPage + 1 : currentPage)}
                  disabled={currentPage * pageSize >= filteredCars.length}
                  className="px-3 py-1 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sledeća
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cars
