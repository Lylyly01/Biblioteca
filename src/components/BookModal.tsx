import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Hash, Palette, FileText, Package, Star, Edit, Trash2, KeyRound, UserCheck } from 'lucide-react';
import { Book, Rental, User, supabase } from '../lib/supabase';

interface BookModalProps {
  book: Book;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onRent: (bookId: string, days: number, userId: string) => void;
  onReturn: (rentalId: string) => void;
  onToggleFeatured: (bookId: string, isFeatured: boolean) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  book,
  onClose,
  onEdit,
  onDelete,
  onRent,
  onReturn,
  onToggleFeatured,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [rentalDays, setRentalDays] = useState(15);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userRentalCounts, setUserRentalCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setTimeout(() => setIsOpen(true), 10);
    loadActiveRentals();
    loadUsers();
    loadUserRentalCounts();
  }, []);

  const loadActiveRentals = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('*')
      .eq('book_id', book.id)
      .eq('returned', false)
      .order('due_date', { ascending: true });

    if (data) setActiveRentals(data);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (data) setUsers(data);
  };

  const loadUserRentalCounts = async () => {
    const { data } = await supabase
      .from('rentals')
      .select('user_id')
      .eq('returned', false);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((rental) => {
        if (rental.user_id) {
          counts[rental.user_id] = (counts[rental.user_id] || 0) + 1;
        }
      });
      setUserRentalCounts(counts);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-5xl h-[85vh] transition-all duration-500 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          perspective: '2000px',
        }}
      >
        <div
          className="book-open w-full h-full bg-amber-50 rounded-lg shadow-2xl flex overflow-hidden"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="w-1/2 p-8 overflow-y-auto border-r-2 border-amber-800"
            style={{
              background: 'linear-gradient(to right, #fef3c7 0%, #fde68a 100%)',
              boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.1)',
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mt-12">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-48 h-72 mx-auto mb-6 rounded shadow-xl object-cover border-4 border-amber-800"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.style.width = '128px';
                    fallback.style.height = '192px';
                    fallback.style.backgroundColor = book.color;
                    fallback.style.margin = '0 auto 24px';
                    fallback.style.borderRadius = '4px';
                    fallback.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                    e.currentTarget.parentElement?.appendChild(fallback);
                  }}
                />
              ) : (
                <div
                  className="w-32 h-48 mx-auto mb-6 rounded shadow-xl"
                  style={{
                    backgroundColor: book.color,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  }}
                />
              )}

              <h2 className="text-3xl font-serif font-bold text-amber-900 mb-2 text-center">
                {book.title}
              </h2>
              <p className="text-lg text-amber-700 mb-6 text-center italic">{book.author}</p>

              <div className="space-y-3 text-amber-900">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-700" />
                  <span className="font-semibold">Gênero:</span>
                  <span>{book.genre}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Hash size={18} className="text-amber-700" />
                  <span className="font-semibold">Páginas:</span>
                  <span>{book.pages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-amber-700" />
                  <span className="font-semibold">Cor:</span>
                  <div
                    className="w-6 h-6 rounded border-2 border-amber-900"
                    style={{ backgroundColor: book.color }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Package size={18} className="text-amber-700" />
                  <span className="font-semibold">Exemplares:</span>
                  <span>{book.available_copies} / {book.total_copies}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-700" />
                  <span className="font-semibold">Destaque:</span>
                  <span>{book.is_featured ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-1/2 p-8 overflow-y-auto"
            style={{
              background: 'linear-gradient(to left, #fef3c7 0%, #fde68a 100%)',
              boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.1)',
            }}
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-amber-700" />
                  <h3 className="text-xl font-serif font-bold text-amber-900">Sinopse</h3>
                </div>
                <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">
                  {book.synopsis || 'Sem sinopse disponível.'}
                </p>
              </div>

              {activeRentals.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={20} className="text-amber-700" />
                    <h3 className="text-xl font-serif font-bold text-amber-900">Aluguéis Ativos</h3>
                  </div>
                  <div className="space-y-2">
                    {activeRentals.map((rental) => {
                      const daysLeft = getDaysUntilDue(rental.due_date);
                      return (
                        <div
                          key={rental.id}
                          className={`p-3 rounded border-2 ${
                            daysLeft <= 1
                              ? 'bg-red-100 border-red-400'
                              : daysLeft <= 3
                              ? 'bg-yellow-100 border-yellow-400'
                              : 'bg-green-100 border-green-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-amber-900">
                                Vencimento: {new Date(rental.due_date).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-amber-700">
                                {daysLeft > 0
                                  ? `Faltam ${daysLeft} dia(s)`
                                  : daysLeft === 0
                                  ? 'Vence hoje!'
                                  : `Atrasado ${Math.abs(daysLeft)} dia(s)`}
                              </p>
                            </div>
                            <button
                              onClick={() => onReturn(rental.id)}
                              className="px-3 py-1 bg-amber-900 text-amber-50 rounded hover:bg-amber-800 text-sm transition-colors"
                            >
                              Devolver
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
                <label className="block text-amber-900 font-semibold mb-2 text-sm">
                  <UserCheck size={16} className="inline mr-1" />
                  Selecionar Usuário *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 mb-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">Selecione um usuário...</option>
                  {users.map((user) => {
                    const rentalCount = userRentalCounts[user.id] || 0;
                    const canRent = rentalCount < 2;
                    return (
                      <option key={user.id} value={user.id} disabled={!canRent}>
                        {user.name} {canRent ? `(${rentalCount}/2 aluguéis)` : '(Limite atingido)'}
                      </option>
                    );
                  })}
                </select>

                {selectedUserId && userRentalCounts[selectedUserId] >= 2 && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-400 rounded text-sm text-red-800">
                    Este usuário já atingiu o limite de 2 aluguéis ativos.
                  </div>
                )}

                <label className="block text-amber-900 font-semibold mb-2 text-sm">
                  Período de Aluguel (dias)
                </label>
                <div className="flex gap-3 items-center mb-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-amber-900 min-w-[60px] text-center">
                    {rentalDays}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!selectedUserId) {
                      alert('Por favor, selecione um usuário.');
                      return;
                    }
                    if (userRentalCounts[selectedUserId] >= 2) {
                      alert('Este usuário já atingiu o limite de 2 aluguéis ativos.');
                      return;
                    }
                    onRent(book.id, rentalDays, selectedUserId);
                  }}
                  disabled={book.available_copies === 0 || !selectedUserId || (selectedUserId && userRentalCounts[selectedUserId] >= 2)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <KeyRound size={20} />
                  {book.available_copies === 0 ? 'Indisponível' : `Alugar por ${rentalDays} dia${rentalDays > 1 ? 's' : ''}`}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => onEdit(book)}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-xl"
                >
                  <Edit size={24} />
                  <span className="text-xs">Editar</span>
                </button>

                <button
                  onClick={() => onToggleFeatured(book.id, !book.is_featured)}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-bold shadow-lg hover:shadow-xl"
                >
                  <Star size={24} fill={book.is_featured ? 'currentColor' : 'none'} />
                  <span className="text-xs">{book.is_featured ? 'Remover' : 'Destacar'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este livro?')) {
                      onDelete(book.id);
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg hover:shadow-xl"
                >
                  <Trash2 size={24} />
                  <span className="text-xs">Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 left-1/2 w-2 h-full transform -translate-x-1/2"
          style={{
            background: 'linear-gradient(to bottom, #78350f 0%, #451a03 50%, #78350f 100%)',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </div>
  );
};
