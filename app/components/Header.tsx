'use client';

export default function Header() {
  return (
    <header style={{
      backgroundColor: '#333',
      color: '#fff',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <nav>
        <h1>Mantle Dex</h1>
      </nav>
    </header>
  );
}
