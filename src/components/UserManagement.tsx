import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, X, Mail, Phone, User as UserIcon } from 'lucide-react';
import { User, supabase } from '../lib/supabase';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (data) setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', editingUser.id);

      if (!error) {
        loadUsers();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('users').insert([formData]);

      if (!error) {
        loadUsers();
        resetForm();
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (!error) {
      loadUsers();
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-300 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-amber-900" />
          <h2 className="text-3xl font-serif font-bold text-amber-900">Usuários</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-900 text-amber-50 rounded-lg hover:bg-amber-800 transition-colors font-semibold shadow-lg"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 mb-6 border-2 border-amber-300 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 rounded-full hover:bg-amber-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-900 font-semibold mb-2 text-sm">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-900 font-semibold mb-2 text-sm">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-900 font-semibold mb-2 text-sm">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-amber-900 text-amber-50 rounded-lg hover:bg-amber-800 transition-colors font-semibold"
              >
                {editingUser ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserIcon size={64} className="mx-auto text-amber-300 mb-4" />
            <p className="text-xl text-amber-700">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg p-4 border-2 border-amber-300 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <UserIcon size={24} className="text-amber-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-lg">{user.name}</h4>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-amber-800">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
