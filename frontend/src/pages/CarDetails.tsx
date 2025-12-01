import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, User as UserIcon, Mail, Shield, Star } from 'lucide-react'
import { carApi, Car, User, CarAdStatus } from '@/services/api'
import { FeaturedBadge } from '@/components/FeaturedAd/FeaturedBadge'
import { useAuth } from '@/AuthContext'

const CarDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [car, setCar] = useState<Car | null>(null)
  const [seller, setSeller] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [adStatus, setAdStatus] = useState<CarAdStatus | null>(null)
  const [soldRestricted, setSoldRestricted] = useState(false)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [isFeaturing, setIsFeaturing] = useState(false)
  const [featureError, setFeatureError] = useState('')
  const [featureSuccess, setFeatureSuccess] = useState(false)
  const [showFeatureLoginPrompt, setShowFeatureLoginPrompt] = useState(false)

  // Function to extract image URLs from various formats
  const normalizeImageUrl = (rawPath: string): string => {
    const cleanPath = rawPath.trim()
    if (!cleanPath) return '/placeholder-car.jpg'

    const lower = cleanPath.toLowerCase()
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return cleanPath
    }

    if (cleanPath.startsWith('/uploads/')) {
      return `http://localhost:8000${cleanPath}`
    }

    if (cleanPath.startsWith('/')) {
      return cleanPath
    }

    if (cleanPath.startsWith('uploads/')) {
      return `http://localhost:8000/${cleanPath}`
    }

    return `http://localhost:8000/uploads/${cleanPath.replace(/^\//, '')}`
  }

  const extractImageUrls = (imageData: any): string[] => {
    if (!imageData) return ['/placeholder-car.jpg'];

    try {
      // Case 1: Already an array
      if (Array.isArray(imageData)) {
        return imageData.map(img => {
          const cleanPath = String(img).replace(/^["'\[]?|["'\]]?$/g, '').trim();
          return normalizeImageUrl(cleanPath)
        });
      }

      // Case 2: Try to parse as JSON string
      if (typeof imageData === 'string') {
        try {
          const parsed = JSON.parse(imageData);
          if (Array.isArray(parsed)) {
            return parsed.map(img => {
              const cleanPath = String(img).replace(/^["'\[]?|["'\]]?$/g, '').trim();
              return normalizeImageUrl(cleanPath)
            });
          }
          // If it's a single string in JSON
          const cleanPath = String(parsed).replace(/^["'\[]?|["'\]]?$/g, '').trim();
          return [normalizeImageUrl(cleanPath)];
        } catch (e) {
          // Not a JSON string, continue to next case
        }

        // Case 3: Comma-separated string
        const images = imageData.split(',').map((img: string) => {
          const cleanPath = img.trim().replace(/^["'\[]?|["'\]]?$/g, '');
          return normalizeImageUrl(cleanPath)
        });

        return images.length > 0 ? images : ['/placeholder-car.jpg'];
      }
    } catch (error) {
      console.error('Error processing images:', error);
    }

    return ['/placeholder-car.jpg'];
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('purchase') === 'success') {
      setShowPurchaseSuccess(true)
    }
  }, [location.search])

  // Fetch car from API
  useEffect(() => {
    if (!id || authLoading) return

    const fetchCarAndSeller = async () => {
      try {
        setLoading(true)
        setSoldRestricted(false)

        const carId = parseInt(id)
        const statusData = await carApi.getAdStatus(carId).catch(() => null)
        setAdStatus(statusData)

        const carData = await carApi.getById(carId)
        setCar(carData)
        setImages(extractImageUrls(carData.slike))

        let sellerData: User | null = null
        try {
          sellerData = await carApi.getSellerInfo(carId)
        } catch (error) {
          console.error('Error fetching seller info:', error)
        }
        setSeller(sellerData)

        if (statusData?.is_sold) {
          const isSellerUser = Boolean(user && sellerData && sellerData.id === user.id)
          const isBuyerUser = Boolean(user && statusData && statusData.buyer_id === user.id)

          if (!isSellerUser && !isBuyerUser) {
            setSoldRestricted(true)
          }
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        setCar(null);
        setImages(['/placeholder-car.jpg']);
      } finally {
        setLoading(false);
      }
    };

    fetchCarAndSeller();
  }, [id, user, authLoading]);

  const isOwnVehicle = useMemo(() => {
    if (!user) return false
    // Check if current user is the seller or the creator of the ad
    return user.id === seller?.id || (adStatus && user.id === adStatus.seller_id)
  }, [user, seller, adStatus])

  const isFeatured = useMemo(() => {
    if (!car) return false
    return Boolean(car.isFeatured ?? car.istaknuto ?? adStatus?.is_featured)
  }, [car, adStatus])

  const isSold = adStatus?.is_sold ?? false
  const isBuyer = useMemo(() => Boolean(user && adStatus?.buyer_id === user.id), [user, adStatus])

  const handleFeatureAd = async () => {
    console.log('handleFeatureAd called')
    console.log('car:', car)
    console.log('adStatus:', adStatus)
    
    if (!id) {
      console.error('No car ID found')
      setFeatureError('Nije pronađen ID vozila')
      return
    }
    
    // Try to get the oglasID from different sources
    const oglasId = car?.oglasID || adStatus?.ad_id
    
    if (!oglasId) {
      console.error('No oglasID found in car or adStatus')
      setFeatureError('Nije pronađen ID oglasa')
      return
    }
    
    console.log('Using oglasID:', oglasId)
    
    if (!confirm('Da li ste sigurni da želite da istaknete ovaj oglas? Naknadno ćete biti preusmereni na stranicu za plaćanje.')) {
      return
    }

    try {
      console.log('Calling featureAd API with oglasID:', oglasId)
      setIsFeaturing(true)
      setFeatureError('')
      
      // Call the API to feature the ad
      await carApi.featureAd(oglasId)
      
      console.log('Feature ad successful')
      // Show success message and refresh the page
      setFeatureSuccess(true)
      
      // Give some time for the user to see the success message
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      console.error('Error in handleFeatureAd:', error)
      const errorMessage = error instanceof Error ? error.message : 'Došlo je do greške prilikom istaknivanja oglasa'
      console.error('Error message:', errorMessage)
      setFeatureError(errorMessage)
    } finally {
      setIsFeaturing(false)
    }
  }

  const handlePurchase = async () => {
    if (!id || !car) return

    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    if (isOwnVehicle) return

    try {
      setPurchaseLoading(true)
      navigate(`/cars/${car.voziloID}/purchase`)
    } finally {
      setPurchaseLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const dismissPurchaseSuccess = () => {
    setShowPurchaseSuccess(false)
    navigate(location.pathname, { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 bg-gray-300"></div>
              <div className="p-8">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (soldRestricted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-2">✅</div>
          <h2 className="text-2xl font-semibold text-gray-900">Ovo vozilo je prodato</h2>
          <p className="text-gray-600">Oglas više nije javno dostupan.</p>
          {!user && (
            <p className="text-sm text-gray-500">Prijavite se da biste proverili da li imate pristup detaljima kupovine.</p>
          )}
          <Link
            to="/cars"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Nazad na vozila</span>
          </Link>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Vozilo nije pronađeno</h2>
          <p className="text-gray-600 mb-4">Oglas koji tražite možda je uklonjen ili ne postoji.</p>
          <Link
            to="/cars"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Nazad na vozila</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showPurchaseSuccess && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-semibold">Kupovina je uspešno završena!</p>
              <p className="text-sm text-green-800">
                Podaci o vozilu ostaju dostupni u ovoj stranici i u sekciji „Moje uplate“.
              </p>
            </div>
            <button
              onClick={dismissPurchaseSuccess}
              className="ml-4 text-sm font-medium text-green-800 hover:text-green-900"
            >
              Zatvori
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/cars"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Nazad na vozila</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              {images.length > 0 ? (
                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-gray-100">
                  <img
                    src={images[0]}
                    alt={`${car.marka} ${car.model}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = '/placeholder-car.jpg'
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] md:aspect-[16/9] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <div className="text-6xl md:text-7xl">🚗</div>
                </div>
              )}

              {/* Image thumbnails */}
              {images.length > 1 && (
                <div className="flex p-4 space-x-3 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`flex-shrink-0 w-24 h-24 border rounded overflow-hidden transition-all ${
                        index === 0 ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-400'
                      }`}
                      onClick={() => {
                        const newImages = [...images]
                        newImages.splice(index, 1)
                        newImages.unshift(img)
                        setImages(newImages)
                      }}
                    >
                      <img
                        src={img}
                        alt={`${car.marka} ${car.model} - Slika ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.onerror = null
                          target.src = '/placeholder-car.jpg'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {car.marka} {car.model}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                        car.stanje === 'Novo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {car.stanje}
                      </span>
                      {isFeatured && (
                        <span className="inline-flex">
                          <FeaturedBadge />
                        </span>
                      )}
                      <span className="flex items-center text-sm md:text-base">
                        <MapPin className="h-4 w-4 mr-1" />
                        {car.lokacija}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-2 md:min-w-[160px]">
                    <div className="text-3xl md:text-4xl font-bold text-primary-600">
                      {formatPrice(car.cena)}
                    </div>
                    <div className="text-sm md:text-base text-gray-600">Cena</div>
                    {isSold && (
                      <div className="text-sm font-semibold text-red-600">Oglas je prodat</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Opis</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">{car.opis}</p>
                </div>

                {/* Specifications */}
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Specifikacije</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Godina proizvodnje</span>
                        <span className="text-gray-900">{car.godinaProizvodnje}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Kilometraža</span>
                        <span className="text-gray-900">{car.kilometraza} km</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Tip goriva</span>
                        <span className="text-gray-900">{car.tipGoriva}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Kubikaža</span>
                        <span className="text-gray-900">{car.kubikaza} cm³</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Tip karoserije</span>
                        <span className="text-gray-900">{car.tipKaroserije}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Snaga motora</span>
                        <span className="text-gray-900">{car.snagaMotoraKW} kW</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Klima</span>
                        <span className="text-gray-900">{car.klima}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-600">Menjač</span>
                        <span className="text-gray-900">{car.tipMenjaca}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 xl:space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kupovina</h3>
              {isSold ? (
                <div className="space-y-2 text-gray-700">
                  {isBuyer ? (
                    <p className="text-green-600 font-medium">Ovo vozilo ste kupili.</p>
                  ) : isOwnVehicle ? (
                    <p className="text-gray-700">Oglas je prodat.</p>
                  ) : (
                    <p className="text-gray-700">Oglas je prodat i nije moguće izvršiti kupovinu.</p>
                  )}
                  {adStatus?.status === 'prodat' && adStatus?.sale_date && (
                    <p className="text-sm text-gray-500">Prodat: {new Date(adStatus.sale_date).toLocaleDateString('sr-RS')}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {isOwnVehicle ? (
                    <div className="space-y-3">
                      <p className="text-gray-700">Ovo je vaš oglas.</p>
                      {!isFeatured && (
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                          <h4 className="text-sm font-medium text-gray-900">Istaknite vaš oglas</h4>
                          <p className="text-xs text-gray-500">Vaš oglas će biti istaknut na vrhu pretrage za 30€</p>
                          <button
                            onClick={handleFeatureAd}
                            disabled={isFeaturing}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isFeaturing ? (
                              'U toku...'
                            ) : (
                              <>
                                <Star className="h-4 w-4" />
                                Istakni oglas (30€)
                              </>
                            )}
                          </button>
                          {featureError && (
                            <div className="text-xs text-red-600 mt-1">{featureError}</div>
                          )}
                          {featureSuccess && (
                            <div className="text-xs text-green-600 mt-1">Uspešno ste istaknuli oglas!</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {showLoginPrompt && (
                        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                          Morate biti prijavljeni da biste kupili vozilo.
                        </div>
                      )}
                      <button
                        onClick={handlePurchase}
                        disabled={purchaseLoading}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {purchaseLoading ? 'Učitavanje...' : 'Kupi vozilo'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacije o prodavcu</h3>
              {seller ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">
                        {seller.korisnickoIme || 'Anoniman prodavac'}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        {seller.tipKorisnika === 'admin' && (
                          <Shield className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                        )}
                        {seller.tipKorisnika === 'admin' ? 'Zvanični prodavac' : 'Privatni prodavac'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    {seller.brojTelefona ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <a href={`tel:${seller.brojTelefona}`} className="hover:text-primary-600">
                          {seller.brojTelefona}
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Broj telefona nije dostupan</p>
                    )}
                    
                    {seller.email ? (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <a href={`mailto:${seller.email}`} className="hover:text-primary-600 truncate">
                          {seller.email}
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Email adresa nije dostupna</p>
                    )}
                    
                    <div className="pt-2 space-y-2 border-t border-gray-100">
                      <p className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Registrovani korisnik</span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Provereni oglasi</span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Sigurna kupovina</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Trenutno nema dostupnih informacija o prodavcu.</p>
                  <p className="text-sm text-gray-400 mt-2">Molimo pokušajte kasnije.</p>
                </div>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Saveti za bezbednost</h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Uvek se sastajite na sigurnom mestu</li>
                <li>• Proverite dokumentaciju vozila</li>
                <li>• Obavite detaljnu proveru vozila</li>
                <li>• Koristite zvanične kanale komunikacije</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetails
