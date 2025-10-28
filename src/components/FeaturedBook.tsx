import React from 'react';
import { Star, X } from 'lucide-react';
import { Book } from '../lib/supabase';

interface FeaturedBookProps {
  book: Book;
  onClick: () => void;
  onRemoveFeatured: () => void;
}

export const FeaturedBook: React.FC<FeaturedBookProps> = ({ book, onClick, onRemoveFeatured }) => {
  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-4 border-yellow-400 shadow-2xl mb-8">
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-amber-900 px-6 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-2">
        <Star size={24} fill="currentColor" />
        Destaque do Mês
        <Star size={24} fill="currentColor" />
      </div>

      <button
        onClick={onRemoveFeatured}
        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
        title="Remover destaque"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-center mt-4">
        <div
          className="w-48 h-72 rounded-lg shadow-2xl cursor-pointer transform transition-transform hover:scale-105"
          style={{
            backgroundColor: book.color,
            background: `linear-gradient(135deg, ${book.color} 0%, ${adjustBrightness(book.color, -20)} 100%)`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset -5px 0 15px rgba(0,0,0,0.2)',
          }}
          onClick={onClick}
        >
          <div className="h-full flex flex-col items-center justify-center p-4 text-white">
            <h3 className="text-2xl font-serif font-bold text-center text-shadow mb-2">
              {book.title}
            </h3>
            <p className="text-sm text-center opacity-90">{book.author}</p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-4xl font-serif font-bold text-amber-900 mb-2">
              {book.title}
            </h3>
            <p className="text-xl text-amber-700 italic mb-4">por {book.author}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-amber-800">
            <span className="px-4 py-2 bg-amber-200 rounded-full font-semibold">
              {book.genre}
            </span>
            <span className="px-4 py-2 bg-amber-200 rounded-full">
              {book.pages} páginas
            </span>
            <span className="px-4 py-2 bg-amber-200 rounded-full">
              {book.available_copies}/{book.total_copies} disponíveis
            </span>
          </div>

          <p className="text-amber-900 leading-relaxed line-clamp-4">
            {book.synopsis || 'Sem sinopse disponível.'}
          </p>

          <button
            onClick={onClick}
            className="px-6 py-3 bg-amber-900 text-amber-50 rounded-lg hover:bg-amber-800 transition-colors font-bold shadow-lg"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
