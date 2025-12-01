import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { carApi, Car } from '../services/api';

type PaymentData = {
  cardNumber: string;
};

const FeaturedAdPayment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carDetails, setCarDetails] = useState({
    marka: '',
    model: '',
    cena: 0
  });
  const FEATURED_PRICE = 30; // 30 EUR

  const [currentCarData, setCurrentCarData] = useState<Car | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const car = await carApi.getOne(Number(id));
        setCarDetails({
          marka: car.marka,
          model: car.model,
          cena: car.cena
        });
        setCurrentCarData(car);
      } catch (err) {
        setError('Došlo je do greške pri učitavanju podataka o vozilu');
        console.error('Error fetching car details:', err);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Format card number (add space after every 4 digits)
    const formattedValue = value
      .replace(/\s/g, '')
      .match(/.{1,4}/g)
      ?.join(' ')
      .substring(0, 19) || '';
      
    setPaymentData({
      cardNumber: formattedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Broj kartice mora imati 16 cifara');
      setLoading(false);
      return;
    }

    try {
      if (!currentCarData) {
        throw new Error('Nisu učitani podaci o vozilu');
      }

      // In a real app, you would process the payment here
      // For now, we'll just update the car to be featured
      const updatedCar = {
        ...currentCarData,
        istaknuto: true,
        // Make sure all required fields are included
        marka: currentCarData.marka,
        model: currentCarData.model,
        godinaProizvodnje: currentCarData.godinaProizvodnje,
        cena: currentCarData.cena,
        tipGoriva: currentCarData.tipGoriva,
        kilometraza: currentCarData.kilometraza,
        lokacija: currentCarData.lokacija,
        stanje: currentCarData.stanje,
        kubikaza: currentCarData.kubikaza,
        opis: currentCarData.opis,
        tipKaroserije: currentCarData.tipKaroserije,
        snagaMotoraKW: currentCarData.snagaMotoraKW,
        klima: currentCarData.klima,
        tipMenjaca: currentCarData.tipMenjaca,
        ostecenje: currentCarData.ostecenje,
        euroNorma: currentCarData.euroNorma,
        slike: currentCarData.slike
      };

      await carApi.update(Number(id), updatedCar);
      
      // Redirect to car details page with success message
      navigate(`/cars/${id}?payment=success`);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Došlo je do greške prilikom obrade plaćanja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Istaknuti oglas</h1>
            <p className="mt-2 text-gray-600">
              Plaćanje za istaknuti oglas - {carDetails.marka} {carDetails.model}
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Vaš oglas će biti istaknut na početnoj stranici i vidljiviji kupcima.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Usluga:</span>
              <span className="font-medium">Istaknuti oglas</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Ukupno za uplatu:</span>
              <span className="text-indigo-600">{FEATURED_PRICE} EUR</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Broj kartice
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center text-lg font-mono tracking-wider"
                required
              />
              <p className="mt-2 text-sm text-gray-500">Unesite broj kartice za plaćanje od 30€</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Obrada...' : `Plati ${FEATURED_PRICE} EUR`}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              Klikom na "Plati" prihvatate naše uslove korišćenja i politiku privatnosti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAdPayment;
