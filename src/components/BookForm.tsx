import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Book } from '../lib/supabase';

interface BookFormProps {
  book?: Book;
  onClose: () => void;
  onSubmit: (bookData: Partial<Book>) => void;
}

const GENRE_OPTIONS = [
  'Ficção',
  'Romance',
  'Mistério',
  'Fantasia',
  'Ficção Científica',
  'Terror',
  'Aventura',
  'Biografia',
  'História',
  'Autoajuda',
  'Técnico',
  'Poesia',
];

const COLOR_PRESETS = [
  '#8B4513', '#2C1810', '#654321', '#A0522D', '#D2691E',
  '#8B0000', '#800020', '#4B0082', '#006400', '#00008B',
  '#8B008B', '#556B2F', '#2F4F4F', '#191970', '#8B4789',
];

export const BookForm: React.FC<BookFormProps> = ({ book, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Ficção',
    pages: 0,
    color: '#8B4513',
    synopsis: '',
    total_copies: 1,
    cover_url: '',
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        pages: book.pages,
        color: book.color,
        synopsis: book.synopsis,
        total_copies: book.total_copies,
        cover_url: book.cover_url || '',
      });
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-amber-900 text-amber-50 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <BookOpen size={24} />
            <h2 className="text-2xl font-serif font-bold">
              {book ? 'Editar Livro' : 'Novo Livro'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-amber-900 font-semibold mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-amber-900 font-semibold mb-2">Autor *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-900 font-semibold mb-2">Gênero *</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
              >
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-900 font-semibold mb-2">Páginas *</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                required
                min="1"
                className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-900 font-semibold mb-2">Exemplares *</label>
            <input
              type="number"
              value={formData.total_copies}
              onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
              required
              min="1"
              className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-amber-900 font-semibold mb-2">Cor do Livro *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    formData.color === color ? 'border-amber-900 scale-110' : 'border-amber-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-12 rounded border-2 border-amber-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-amber-900 font-semibold mb-2">URL da Capa do Livro</label>
            <input
              type="url"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
              placeholder="https://exemplo.com/capa-do-livro.jpg"
            />
            {formData.cover_url && (
              <div className="mt-3">
                <p className="text-sm text-amber-700 mb-2">Visualização:</p>
                <img
                  src={formData.cover_url}
                  alt="Preview da capa"
                  className="w-32 h-48 object-cover rounded shadow-lg border-2 border-amber-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-amber-900 font-semibold mb-2">Sinopse</label>
            <textarea
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white resize-none"
              placeholder="Descreva a história do livro..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-amber-900 text-amber-50 rounded hover:bg-amber-800 transition-colors font-semibold"
            >
              {book ? 'Salvar Alterações' : 'Adicionar Livro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
