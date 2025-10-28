import React, { useState, useEffect } from "react";
import { Search, Plus, Library, Filter, Calendar, Users } from "lucide-react";
import { Book, supabase } from "./lib/supabase";
import { BookSpine } from "./components/BookSpine";
import { BookModal } from "./components/BookModal";
import { BookForm } from "./components/BookForm";
import { RentalTracker } from "./components/RentalTracker";
import { FeaturedBook } from "./components/FeaturedBook";
import { UserManagement } from "./components/UserManagement";

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [showRentals, setShowRentals] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedGenre]);

  const loadBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("genre", { ascending: true })
      .order("title", { ascending: true });

    if (data) setBooks(data);
  };

  const filterBooks = () => {
    let filtered = books.filter((book) => !book.is_featured);

    if (searchTerm) {
      filtered = filtered.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== "Todos") {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    setFilteredBooks(filtered);
  };

  const handleAddBook = async (bookData: Partial<Book>) => {
    const { error } = await supabase.from("books").insert([
      {
        ...bookData,
        available_copies: bookData.total_copies || 1,
        is_featured: false,
      },
    ]);

    if (!error) {
      loadBooks();
      setShowForm(false);
    }
  };

  const handleEditBook = async (bookData: Partial<Book>) => {
    if (!editingBook) return;

    const currentBook = books.find((b) => b.id === editingBook.id);
    const copiesDiff =
      (bookData.total_copies || 0) - (currentBook?.total_copies || 0);
    const newAvailableCopies =
      (currentBook?.available_copies || 0) + copiesDiff;

    const { error } = await supabase
      .from("books")
      .update({
        ...bookData,
        available_copies: Math.max(0, newAvailableCopies),
      })
      .eq("id", editingBook.id);

    if (!error) {
      loadBooks();
      setShowForm(false);
      setEditingBook(undefined);
      setSelectedBook(null);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const { error } = await supabase.from("books").delete().eq("id", bookId);

    if (!error) {
      loadBooks();
      setSelectedBook(null);
    }
  };

  const handleRentBook = async (
    bookId: string,
    days: number,
    userId: string
  ) => {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.available_copies === 0) return;

    const rentalDate = new Date();
    const dueDate = new Date(rentalDate);
    dueDate.setDate(dueDate.getDate() + days);

    const { error: rentalError } = await supabase.from("rentals").insert([
      {
        book_id: bookId,
        user_id: userId,
        rental_date: rentalDate.toISOString(),
        due_date: dueDate.toISOString(),
        returned: false,
      },
    ]);

    if (!rentalError) {
      const { error: bookError } = await supabase
        .from("books")
        .update({ available_copies: book.available_copies - 1 })
        .eq("id", bookId);

      if (!bookError) {
        loadBooks();
        setSelectedBook(null);
        alert(
          `Livro alugado com sucesso! Devolução em ${days} dia${
            days > 1 ? "s" : ""
          }.`
        );
      }
    }
  };

  const handleReturnBook = async (rentalId: string) => {
    const { data: rentalData } = await supabase
      .from("rentals")
      .select("book_id")
      .eq("id", rentalId)
      .maybeSingle();

    if (!rentalData) return;

    const { error: rentalError } = await supabase
      .from("rentals")
      .update({ returned: true, returned_date: new Date().toISOString() })
      .eq("id", rentalId);

    if (!rentalError) {
      const book = books.find((b) => b.id === rentalData.book_id);
      if (book) {
        await supabase
          .from("books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", book.id);

        loadBooks();
        setSelectedBook(null);
      }
    }
  };

  const handleToggleFeatured = async (bookId: string, isFeatured: boolean) => {
    if (isFeatured) {
      await supabase
        .from("books")
        .update({ is_featured: false })
        .neq("id", bookId);
    }

    const { error } = await supabase
      .from("books")
      .update({ is_featured: isFeatured })
      .eq("id", bookId);

    if (!error) {
      loadBooks();
      const updatedBook = books.find((b) => b.id === bookId);
      if (updatedBook && selectedBook) {
        setSelectedBook({ ...updatedBook, is_featured: isFeatured });
      }
    }
  };

  const featuredBook = books.find((book) => book.is_featured);
  const genres = [
    "Todos",
    ...Array.from(
      new Set(books.filter((b) => !b.is_featured).map((book) => book.genre))
    ),
  ];
  const booksByGenre = filteredBooks.reduce((acc, book) => {
    if (!acc[book.genre]) acc[book.genre] = [];
    acc[book.genre].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  const handleRemoveFeatured = async () => {
    if (!featuredBook) return;
    await supabase
      .from("books")
      .update({ is_featured: false })
      .eq("id", featuredBook.id);
    loadBooks();
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: `
          linear-gradient(90deg, #f8f8f8 1px, transparent 1px),
          linear-gradient(180deg, #f8f8f8 1px, transparent 1px),
          linear-gradient(90deg, #e8e8e8 1px, transparent 1px),
          linear-gradient(180deg, #e8e8e8 1px, transparent 1px)
        `,
        backgroundSize: "100px 50px, 100px 50px, 200px 100px, 200px 100px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Library size={48} className="text-amber-900" />
            <h1 className="text-5xl font-serif font-bold text-amber-900">
              Biblioteca
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between bg-amber-50 p-4 rounded-lg border-2 border-amber-300 shadow-md">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Pesquisar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-amber-900" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 border-2 border-amber-300 rounded focus:border-amber-500 focus:outline-none bg-white text-amber-900 font-semibold"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setShowRentals(!showRentals);
                setShowUsers(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Calendar size={20} />
              {showRentals ? "Ver Estante" : "Ver Aluguéis"}
            </button>

            <button
              onClick={() => {
                setShowUsers(!showUsers);
                setShowRentals(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Users size={20} />
              {showUsers ? "Ver Estante" : "Usuários"}
            </button>

            <button
              onClick={() => {
                setEditingBook(undefined);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-900 text-amber-50 rounded-lg hover:bg-amber-800 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Adicionar Livro
            </button>
          </div>
        </header>

        {showRentals ? (
          <RentalTracker />
        ) : showUsers ? (
          <UserManagement />
        ) : (
          <main>
            {featuredBook && (
              <FeaturedBook
                book={featuredBook}
                onClick={() => setSelectedBook(featuredBook)}
                onRemoveFeatured={handleRemoveFeatured}
              />
            )}

            {Object.keys(booksByGenre).length === 0 ? (
              <div className="text-center py-12">
                <Library size={64} className="mx-auto text-amber-300 mb-4" />
                <p className="text-xl text-amber-700">
                  {searchTerm || selectedGenre !== "Todos"
                    ? "Nenhum livro encontrado."
                    : "Sua biblioteca está vazia. Adicione seu primeiro livro!"}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(booksByGenre).map(([genre, genreBooks]) => (
                  <div key={genre} className="relative">
                    <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-6 py-3 rounded-t-lg shadow-md">
                      <h2 className="text-2xl font-serif font-bold text-amber-50 flex items-center gap-3">
                        <Library size={24} />
                        {genre}
                        <span className="text-sm text-amber-200 font-normal">
                          ({genreBooks.length}{" "}
                          {genreBooks.length === 1 ? "livro" : "livros"})
                        </span>
                      </h2>
                    </div>

                    <div
                      className="relative rounded-b-lg overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(180deg, #78350f 0%, #5a2a0f 50%, #3d1c08 100%)",
                        padding: "24px",
                        boxShadow:
                          "inset 0 4px 12px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
                        border: "3px solid #92400e",
                      }}
                    >
                      <div className="flex flex-wrap gap-2 items-end justify-start">
                        {genreBooks.map((book) => (
                          <BookSpine
                            key={book.id}
                            book={book}
                            onClick={() => setSelectedBook(book)}
                          />
                        ))}
                      </div>

                      <div
                        className="absolute bottom-6 left-0 right-0 h-4"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {selectedBook && (
          <BookModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onEdit={(book) => {
              setEditingBook(book);
              setShowForm(true);
            }}
            onDelete={handleDeleteBook}
            onRent={handleRentBook}
            onReturn={handleReturnBook}
            onToggleFeatured={handleToggleFeatured}
          />
        )}

        {showForm && (
          <BookForm
            book={editingBook}
            onClose={() => {
              setShowForm(false);
              setEditingBook(undefined);
            }}
            onSubmit={editingBook ? handleEditBook : handleAddBook}
          />
        )}
      </div>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Texto */}
            <p className="text-gray-600 text-sm font-medium">
              Feito por: Henrique Krumenauer
            </p>

            {/* Ícones */}
            <div className="flex space-x-4">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/seu-perfil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/henrique_krum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-600 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.208 14.836 3.7 13.7 3.7 12.405c0-2.027 1.12-3.835 2.789-4.734c.49-.245 1.053-.408 1.616-.408h8.826c.49 0 .98.163 1.37.408c1.67.9 2.79 2.707 2.79 4.734c0 1.297-.49 2.431-1.297 3.286c-.898.898-2.063 1.297-3.36 1.297H8.449z" />
                  <path d="M12.017 5.876c-3.406 0-6.14 2.735-6.14 6.14c0 3.406 2.734 6.14 6.14 6.14c3.405 0 6.14-2.734 6.14-6.14c0-3.405-2.735-6.14-6.14-6.14zm0 10.123c-2.207 0-3.983-1.776-3.983-3.983s1.776-3.983 3.983-3.983c2.207 0 3.983 1.776 3.983 3.983s-1.776 3.983-3.983 3.983z" />
                  <circle cx="18.331" cy="5.702" r="1.441" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Lylyly01"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
