import { api } from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

export const paymentService = {
  async processPayment(amount: number, adId: number): Promise<boolean> {
    try {
      // In a real app, this would call your backend to process the payment
      // For demo purposes, we'll simulate a successful payment
      const response = await api.post('/payments/process', {
        amount,
        adId,
        currency: 'EUR',
      });

      toast({
        title: 'Plaćanje uspešno',
        description: 'Uspešno ste platili za istaknuti oglas.',
      });
      
      return true;
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Greška pri plaćanju',
        description: 'Došlo je do greške prilikom obrade plaćanja. Molimo pokušajte ponovo.',
        variant: 'destructive',
      });
      return false;
    }
  },

  getFeatureAdPrice(): number {
    return 30; // 30 EUR for featured ad
  },
};
