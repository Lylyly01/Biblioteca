import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RentalWithBook {
  id: string;
  book_id: string;
  rental_date: string;
  due_date: string;
  returned: boolean;
  book_title: string;
  book_author: string;
}

export const RentalTracker: React.FC = () => {
  const [rentals, setRentals] = useState<RentalWithBook[]>([]);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    const { data: rentalsData } = await supabase
      .from('rentals')
      .select('*')
      .eq('returned', false)
      .order('due_date', { ascending: true });

    if (rentalsData) {
      const rentalsWithBooks = await Promise.all(
        rentalsData.map(async (rental) => {
          const { data: bookData } = await supabase
            .from('books')
            .select('title, author')
            .eq('id', rental.book_id)
            .maybeSingle();

          return {
            ...rental,
            book_title: bookData?.title || 'Livro não encontrado',
            book_author: bookData?.author || '',
          };
        })
      );

      setRentals(rentalsWithBooks);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleReturn = async (rentalId: string) => {
    const rental = rentals.find((r) => r.id === rentalId);
    if (!rental) return;

    const { error: rentalError } = await supabase
      .from('rentals')
      .update({ returned: true, returned_date: new Date().toISOString() })
      .eq('id', rentalId);

    if (!rentalError) {
      const { data: bookData } = await supabase
        .from('books')
        .select('available_copies')
        .eq('id', rental.book_id)
        .maybeSingle();

      if (bookData) {
        await supabase
          .from('books')
          .update({ available_copies: bookData.available_copies + 1 })
          .eq('id', rental.book_id);
      }

      loadRentals();
    }
  };

  if (rentals.length === 0) {
    return (
      <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-300">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={24} className="text-green-600" />
          <h3 className="text-xl font-serif font-bold text-amber-900">Aluguéis</h3>
        </div>
        <p className="text-amber-700">Nenhum livro alugado no momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-300">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={24} className="text-amber-900" />
        <h3 className="text-xl font-serif font-bold text-amber-900">Aluguéis Ativos</h3>
      </div>

      <div className="space-y-3">
        {rentals.map((rental) => {
          const daysLeft = getDaysUntilDue(rental.due_date);
          const isOverdue = daysLeft < 0;
          const isDueSoon = daysLeft <= 1 && daysLeft >= 0;

          return (
            <div
              key={rental.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isOverdue
                  ? 'bg-red-100 border-red-400 shadow-lg'
                  : isDueSoon
                  ? 'bg-yellow-100 border-yellow-400 shadow-md animate-pulse'
                  : 'bg-green-100 border-green-400'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {(isOverdue || isDueSoon) && (
                      <AlertCircle size={18} className={isOverdue ? 'text-red-600' : 'text-yellow-600'} />
                    )}
                    <h4 className="font-bold text-amber-900">{rental.book_title}</h4>
                  </div>
                  <p className="text-sm text-amber-700 mb-2">{rental.book_author}</p>
                  <div className="text-sm text-amber-900">
                    <p>
                      <span className="font-semibold">Alugado em:</span>{' '}
                      {new Date(rental.rental_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p>
                      <span className="font-semibold">Vencimento:</span>{' '}
                      {new Date(rental.due_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="font-bold mt-1">
                      {isOverdue
                        ? `⚠️ Atrasado ${Math.abs(daysLeft)} dia(s)`
                        : daysLeft === 0
                        ? '⏰ Vence HOJE!'
                        : `Faltam ${daysLeft} dia(s)`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleReturn(rental.id)}
                  className="px-4 py-2 bg-amber-900 text-amber-50 rounded hover:bg-amber-800 transition-colors font-semibold whitespace-nowrap"
                >
                  Devolver
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
