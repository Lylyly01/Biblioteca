/*
  # Digital Library Database Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key) - Unique identifier for each book
      - `title` (text) - Book title
      - `author` (text) - Book author
      - `genre` (text) - Book genre for shelf organization
      - `pages` (integer) - Number of pages
      - `color` (text) - Custom color for book spine
      - `synopsis` (text) - Book synopsis/description
      - `total_copies` (integer) - Total number of copies available
      - `available_copies` (integer) - Currently available copies
      - `is_featured` (boolean) - Whether this book is featured
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `rentals`
      - `id` (uuid, primary key) - Unique identifier for each rental
      - `book_id` (uuid, foreign key) - Reference to books table
      - `rental_date` (timestamptz) - When the book was rented
      - `due_date` (timestamptz) - When the book is due (rental_date + 15 days)
      - `returned` (boolean) - Whether the book has been returned
      - `returned_date` (timestamptz) - When the book was returned
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a single-user library app)
    
  3. Important Notes
    - Available copies are tracked separately from total copies
    - Only one book can be featured at a time (enforced at application level)
    - Rentals have a 15-day duration
    - Books cannot be rented when available_copies reaches 0
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  pages integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#8B4513',
  synopsis text DEFAULT '',
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rental_date timestamptz DEFAULT now(),
  due_date timestamptz NOT NULL,
  returned boolean DEFAULT false,
  returned_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Create policies for books table
CREATE POLICY "Allow public read access to books"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to books"
  ON books FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to books"
  ON books FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to books"
  ON books FOR DELETE
  TO public
  USING (true);

-- Create policies for rentals table
CREATE POLICY "Allow public read access to rentals"
  ON rentals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to rentals"
  ON rentals FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to rentals"
  ON rentals FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to rentals"
  ON rentals FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_is_featured ON books(is_featured);
CREATE INDEX IF NOT EXISTS idx_rentals_book_id ON rentals(book_id);
CREATE INDEX IF NOT EXISTS idx_rentals_returned ON rentals(returned);
CREATE INDEX IF NOT EXISTS idx_rentals_due_date ON rentals(due_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for books table
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();