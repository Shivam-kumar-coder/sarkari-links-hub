
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, Moon, Sun, ExternalLink, Filter, X, Share2, Globe, ArrowUp, Info } from 'lucide-react';
import { links } from './data/links';
import { GovernmentLink, Theme } from './types';

// --- Sub-Components (Memoized for Performance) ---

const Header = memo(({ theme, toggleTheme }: { theme: Theme, toggleTheme: () => void }) => (
  <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="/" className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">S</div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            Sarkari Hub
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold hidden sm:block">Direct Link Hub</span>
        </div>
      </a>
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </div>
  </header>
));

const HighlightedText = memo(({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
});

const LinkCard = memo(({ link, searchQuery }: { link: GovernmentLink, searchQuery: string }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(link.url);
  }, [link.url]);

  return (
    <article className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 flex flex-col h-full ring-blue-500 focus-within:ring-2">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
          {link.category}
        </span>
        <button 
          onClick={handleCopy}
          className="p-2 -mr-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          title="Copy Link URL"
          aria-label={`Copy link for ${link.title}`}
        >
          <Share2 size={16} />
        </button>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
        <HighlightedText text={link.title} highlight={searchQuery} />
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
        <HighlightedText text={link.description} highlight={searchQuery} />
      </p>

      <div className="mt-auto pt-4 flex flex-col space-y-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
          {link.keywords.slice(0, 3).map((kw, idx) => (
            <span key={idx} className="text-[10px] text-slate-400 dark:text-slate-500">
              #{kw.replace(/\s+/g, '')}
            </span>
          ))}
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-blue-600"
        >
          <span>Visit Official Portal</span>
          <ExternalLink size={16} className="ml-2" />
        </a>
      </div>
    </article>
  );
});

// --- Main App Component ---

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved as Theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(links.map(l => l.category)));
    return ['All', ...cats.sort()];
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const filteredLinks = useMemo(() => {
    const q = query.toLowerCase().trim();
    return links.filter(link => {
      const matchesCategory = activeCategory === 'All' || link.category === activeCategory;
      if (!matchesCategory) return false;
      
      if (!q) return true;
      return (
        link.title.toLowerCase().includes(q) ||
        link.description.toLowerCase().includes(q) ||
        link.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 sm:py-12">
        
        {/* Hero Section */}
        <section className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Sarkari Direct <span className="text-blue-600">Link Hub</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
            A fast, verified directory for instant access to official Indian government portals. 
            No advertisements, no middle-men, just official links.
          </p>
        </section>

        {/* Search Experience */}
        <div className="max-w-2xl mx-auto mb-10 w-full">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search services (e.g. GST, Passport, ITR)..."
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-900 dark:text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search government services"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Chipset */}
        <div className="mb-10 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav className="flex space-x-2" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Dynamic Grid */}
        <div className="min-h-[40vh]">
          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} searchQuery={query} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                <Search size={36} className="text-slate-300" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Service Not Found</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto text-sm">
                We couldn't find any results matching your search query. Try keywords like "PAN", "Aadhaar", or "Tax".
              </p>
              <button 
                onClick={() => { setQuery(''); setActiveCategory('All'); }}
                className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
              >
                View All Services
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer & Disclosure */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-4 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[10px]">S</div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Sarkari Direct Link Hub</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                A verified index to help citizens find legitimate government portals. Designed for speed, security, and ease of use.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Official Resources</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 flex items-center">National Portal <ExternalLink size={12} className="ml-1" /></a>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 flex items-center">Digital India <ExternalLink size={12} className="ml-1" /></a>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start space-x-3 mb-2">
                <Info size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notice</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                Sarkari Direct Link Hub is an independent directory. We are not a government entity. We simplify access to public information. Always verify you are on a <b>.gov.in</b> domain before sharing data.
              </p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] font-medium text-slate-400 space-y-4 sm:space-y-0">
            <p>&copy; {new Date().getFullYear()} Sarkari Direct Link Hub. Verified Index.</p>
            <div className="flex space-x-6 items-center">
              <span className="flex items-center"><Globe size={12} className="mr-1.5" /> India</span>
              <a href="#" className="hover:text-blue-500">Privacy Policy</a>
              <a href="#" className="hover:text-blue-500">Add a Link</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-2xl shadow-2xl transition-all duration-300 transform active:scale-90 z-50 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

export default App;
