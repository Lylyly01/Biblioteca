import React from 'react';
import { Book } from '../lib/supabase';

interface BookSpineProps {
  book: Book;
  onClick: () => void;
}

export const BookSpine: React.FC<BookSpineProps> = ({ book, onClick }) => {
  return (
    <div
      className="book-spine cursor-pointer transition-all duration-300 hover:translate-y-[-8px] hover:shadow-2xl"
      style={{
        backgroundColor: book.color,
        height: '240px',
        width: '40px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        boxShadow: '2px 0 8px rgba(0,0,0,0.3), inset -2px 0 4px rgba(0,0,0,0.2)',
      }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 5%, transparent 95%, rgba(0,0,0,0.2) 100%)`,
        }}
      >
        <div
          className="text-white font-serif font-bold text-xs px-1 text-center leading-tight"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            maxWidth: '35px',
            wordBreak: 'break-word',
          }}
        >
          {book.title.toUpperCase()}
        </div>
      </div>

      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-1"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
        }}
      />

      {book.available_copies === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-1 py-0.5 rounded rotate-45 opacity-90">
          ALUGADO
        </div>
      )}
    </div>
  );
};
