import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { searchContent, groupResultsByCategory, SearchResult } from '@/lib/searchData';
import { useTranslation } from 'react-i18next';
import { debounce } from '@/lib/utils';

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      const searchResults = searchContent(searchQuery);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    }, 300)
  ).current;

  useEffect(() => {
    if (query.trim().length >= 2) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setIsMobileExpanded(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setIsMobileExpanded(false);
    }
  };

  const groupedResults = groupResultsByCategory(results);

  return (
    <div ref={searchRef} className="relative">
      {/* Mobile: Icon that expands to search bar */}
      <div className="md:hidden">
        {!isMobileExpanded ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileExpanded(true)}
            className="gap-2"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        ) : (
          <div className="fixed inset-x-0 top-20 z-50 bg-background border-b shadow-lg p-4">
            <div className="container mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('search.placeholder', 'Search your planner...')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9 pr-9 h-11"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileExpanded(false);
                  handleClear();
                }}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Always visible search bar */}
      <div className="hidden md:block relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={t('search.placeholder', 'Search your planner...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 h-10 bg-background"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50 md:w-[500px]">
          <div className="p-2">
            {Object.entries(groupedResults).map(([category, categoryResults]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h3 className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-1">
                  {categoryResults.slice(0, 5).map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                    >
                      <div className="font-medium text-sm text-foreground">
                        {result.title}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg p-4 z-50 md:w-[500px]">
          <p className="text-sm text-muted-foreground text-center">
            {t('search.noResults', 'No matches found. Try another word or check a different section.')}
          </p>
        </div>
      )}
    </div>
  );
};
