import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { carApi, Car } from '../services/api';
import { Upload, X } from 'lucide-react';
import {
  CAR_BRANDS,
  BRAND_OPTIONS,
  BODY_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  EURO_NORM_OPTIONS,
  STANJE_OPTIONS,
  CLIMATE_FORM_OPTIONS,
  FUEL_OPTIONS,
} from '@/constants/carOptions';

type CarFormData = Omit<Car, 'voziloID' | 'created_at' | 'updated_at' | 'deleted_at'> & {
  imageFiles?: File[];
};

const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CarFormData>({
    marka: '',
    model: '',
    godinaProizvodnje: new Date().getFullYear(),
    cena: undefined as unknown as number, // Will be handled as empty string in the form
    tipGoriva: 'Benzin',
    kilometraza: '',
    lokacija: '',
    slike: '',
    stanje: 'Novo',
    kubikaza: undefined as unknown as number, // Will be handled as empty string in the form
    opis: '',
    tipKaroserije: 'Limuzina',
    snagaMotoraKW: undefined as unknown as number, // Will be handled as empty string in the form
    klima: CLIMATE_FORM_OPTIONS[0].value,
    tipMenjaca: TRANSMISSION_OPTIONS[0],
    ostecenje: false,
    euroNorma: EURO_NORM_OPTIONS[EURO_NORM_OPTIONS.length - 1],
    istaknuto: false,
  });
  
  const [featuredAd, setFeaturedAd] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : 
             type === 'checkbox' ? (e.target as HTMLInputElement).checked :
             value
    }));
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value)
    setFormData((prev) => ({
      ...prev,
      marka: value,
      model: '',
    }))
  }

  const availableModels = selectedBrand
    ? CAR_BRANDS[selectedBrand] || []
    : [];

  // Helper function to handle empty number inputs
  const getNumberValue = (value: number | undefined): string => {
    return value === undefined ? '' : String(value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      imageFiles: [...(prev.imageFiles || []), ...newFiles]
    }));
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles?.filter((_, i) => i !== index) || []
    }));
    
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      console.log('Form data before sending:', formData);
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'imageFiles' && value !== undefined) {
          formDataToSend.append(key, String(value));
          console.log(`Added field: ${key} = ${value}`);
        }
      });

      // Add image files if they exist
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        console.log(`Adding ${formData.imageFiles.length} image files`);
        formDataToSend.delete('slike'); // Remove the old slike field
        formData.imageFiles.forEach((file) => {
          formDataToSend.append('slike', file);
          console.log('Added file:', file.name, 'type:', file.type, 'size:', file.size);
        });
      } else {
        console.log('No image files to upload');
      }

      // Log FormData contents (for debugging)
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}, ${value.type}, ${value.size} bytes`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      console.log('Sending request to server...');
      const response = await carApi.create(formDataToSend, true);
      console.log('Server response:', response);
      
      if (featuredAd) {
        // Redirect to payment page for featured ad
        navigate(`/cars/${response.voziloID}/featured-payment`);
      } else {
        navigate('/cars');
      }
    } catch (err) {
      console.error('Detailed error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        response: (err as any)?.response,
        status: (err as any)?.status,
        data: (err as any)?.data
      });
      setError(`Došlo je do greške prilikom dodavanja vozila: ${err instanceof Error ? err.message : 'Nepoznata greška'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dodaj novo vozilo</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Osnovni podaci</h2>
                
                <div>
                  <label htmlFor="marka" className="block text-sm font-medium text-gray-700">Marka</label>
                  <select
                    id="marka"
                    name="marka"
                    value={formData.marka}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="" disabled>
                      Odaberite marku
                    </option>
                    {BRAND_OPTIONS.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                  <select
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    disabled={!formData.marka}
                  >
                    {(!formData.marka || availableModels.length === 0) && (
                      <option value="" disabled>
                        {formData.marka ? 'Modeli nisu dostupni' : 'Odaberite marku'}
                      </option>
                    )}
                    {availableModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="godinaProizvodnje" className="block text-sm font-medium text-gray-700">Godina proizvodnje</label>
                  <input
                    type="number"
                    id="godinaProizvodnje"
                    name="godinaProizvodnje"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.godinaProizvodnje}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cena" className="block text-sm font-medium text-gray-700">Cena (€)</label>
                  <input
                    type="number"
                    id="cena"
                    name="cena"
                    min="0"
                    step="100"
                    value={getNumberValue(formData.cena)}
                    placeholder="Unesite cenu"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Tehnički podaci</h2>
                
                <div>
                  <label htmlFor="tipGoriva" className="block text-sm font-medium text-gray-700">Gorivo</label>
                  <select
                    id="tipGoriva"
                    name="tipGoriva"
                    value={formData.tipGoriva}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {FUEL_OPTIONS.map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="kilometraza" className="block text-sm font-medium text-gray-700">Kilometraža</label>
                  <input
                    type="text"
                    id="kilometraza"
                    name="kilometraza"
                    value={formData.kilometraza}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="kubikaza" className="block text-sm font-medium text-gray-700">Kubikaža (cm³)</label>
                  <input
                    type="number"
                    id="kubikaza"
                    name="kubikaza"
                    min="0"
                    value={getNumberValue(formData.kubikaza)}
                    placeholder="Unesite kubikažu"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="snagaMotoraKW" className="block text-sm font-medium text-gray-700">Snaga motora (kW)</label>
                  <input
                    type="number"
                    id="snagaMotoraKW"
                    name="snagaMotoraKW"
                    min="0"
                    value={getNumberValue(formData.snagaMotoraKW)}
                    placeholder="Unesite snagu motora"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Dodatne informacije</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="lokacija" className="block text-sm font-medium text-gray-700">Lokacija</label>
                  <input
                    type="text"
                    id="lokacija"
                    name="lokacija"
                    value={formData.lokacija}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stanje" className="block text-sm font-medium text-gray-700">Stanje</label>
                  <select
                    id="stanje"
                    name="stanje"
                    value={formData.stanje}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {STANJE_OPTIONS.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tipKaroserije" className="block text-sm font-medium text-gray-700">Karoserija</label>
                  <select
                    id="tipKaroserije"
                    name="tipKaroserije"
                    value={formData.tipKaroserije}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {BODY_TYPE_OPTIONS.map((body) => (
                      <option key={body} value={body}>{body}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tipMenjaca" className="block text-sm font-medium text-gray-700">Menjač</label>
                  <select
                    id="tipMenjaca"
                    name="tipMenjaca"
                    value={formData.tipMenjaca}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {TRANSMISSION_OPTIONS.map((gear) => (
                      <option key={gear} value={gear}>{gear}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="klima" className="block text-sm font-medium text-gray-700">Klima</label>
                  <select
                    id="klima"
                    name="klima"
                    value={formData.klima}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {CLIMATE_FORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="euroNorma" className="block text-sm font-medium text-gray-700">Euro norma</label>
                  <select
                    id="euroNorma"
                    name="euroNorma"
                    value={formData.euroNorma}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {EURO_NORM_OPTIONS.map((norm) => (
                      <option key={norm} value={norm}>{norm}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="ostecenje"
                    name="ostecenje"
                    type="checkbox"
                    checked={formData.ostecenje}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="ostecenje" className="ml-2 block text-sm text-gray-700">
                    Oštećeno vozilo
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="slike" className="block text-sm font-medium text-gray-700 mb-2">Dodajte slike vozila</label>
                
                {/* Image previews */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`} 
                        className="h-24 w-24 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        aria-label="Ukloni sliku"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* File input */}
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex justify-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Dodajte fajlove</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">ili prevucite i ispustite</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF do 10MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="opis" className="block text-sm font-medium text-gray-700">Opis vozila</label>
                <textarea
                  id="opis"
                  name="opis"
                  rows={4}
                  value={formData.opis}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Detaljan opis vozila..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/cars')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Odustani
              </button>
            </div>

            {/* Featured Ad Option */}
            <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="featuredAd"
                    name="featuredAd"
                    type="checkbox"
                    checked={featuredAd}
                    onChange={(e) => setFeaturedAd(e.target.checked)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="featuredAd" className="font-medium text-gray-700">
                    Istaknuti oglas (+30€)
                  </label>
                  <p className="text-gray-500">
                    Vaš oglas će biti istaknut na početnoj stranici i vidljiviji kupcima.
                    Nakon čuvanja oglasa bićete preusmereni na stranicu za plaćanje.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Čuvanje...' : 'Sačuvaj oglas'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
