import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '', id = 'search', onClear }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor={id} className="sr-only">Search</label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>

      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 pr-10 h-10 rounded-lg shadow-sm border"
        aria-label="Search"
      />

      {value && value.length > 0 && (
        <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (onClear) onClear();
            }}
            aria-label="Clear search"
            className="w-8 h-8"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
