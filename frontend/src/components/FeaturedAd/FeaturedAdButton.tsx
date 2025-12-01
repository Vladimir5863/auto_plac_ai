import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { paymentService } from '@/services/paymentService';

interface FeaturedAdButtonProps {
  adId: number;
  isFeatured: boolean;
  onSuccess?: () => void;
}

export function FeaturedAdButton({ adId, isFeatured, onSuccess }: FeaturedAdButtonProps) {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleFeatureAd = async () => {
    if (!token || !user) {
      toast({
        title: 'Morate biti prijavljeni',
        description: 'Da biste istaknuli oglas, morate biti prijavljeni.',
        type: 'destructive',
      });
      return;
    }

    if (isFeatured) {
      return;
    }

    const confirmFeature = window.confirm(
      `Da li želite da istaknete ovaj oglas? Cena: ${paymentService.getFeatureAdPrice()}€\n` +
      'Bićete preusmereni na stranicu za plaćanje.'
    );

    if (!confirmFeature) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Process payment
      const paymentSuccess = await paymentService.processPayment(
        paymentService.getFeatureAdPrice(),
        adId
      );

      if (paymentSuccess && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error featuring ad:', error);
      toast({
        title: 'Greška',
        description: 'Došlo je do greške prilikom obrade vašeg zahteva.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFeatured) {
    return (
      <Button variant="outline" className="gap-2 bg-yellow-50 border-yellow-200 hover:bg-yellow-100">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
        <span className="text-yellow-800">Istaknuto</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
      onClick={handleFeatureAd}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Obrađuje se...</span>
        </>
      ) : (
        <>
          <Star className="h-4 w-4" />
          <span>Istakni oglas ({paymentService.getFeatureAdPrice()}€)</span>
        </>
      )}
    </Button>
  );
}
