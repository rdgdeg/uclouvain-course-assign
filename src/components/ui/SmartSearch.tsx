import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchOption {
  id: string;
  label: string;
  description?: string;
  category?: string;
}

interface SmartSearchProps {
  options: SearchOption[];
  value?: string;
  onSelect: (option: SearchOption) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  onCustomValue?: (value: string) => void;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  options,
  value,
  onSelect,
  placeholder = "Rechercher...",
  className,
  disabled = false,
  allowCustom = false,
  onCustomValue,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState<SearchOption[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrer les options basé sur la recherche
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredOptions(options.slice(0, 10)); // Limiter à 10 résultats par défaut
      return;
    }

    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.category?.toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredOptions(filtered.slice(0, 20)); // Limiter à 20 résultats
  }, [searchValue, options]);

  // Grouper les options par catégorie
  const groupedOptions = filteredOptions.reduce((groups, option) => {
    const category = option.category || 'Autres';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(option);
    return groups;
  }, {} as Record<string, SearchOption[]>);

  const handleSelect = (option: SearchOption) => {
    setSearchValue(option.label);
    onSelect(option);
    setOpen(false);
  };

  const handleCustomValue = () => {
    if (allowCustom && onCustomValue && searchValue.trim()) {
      onCustomValue(searchValue.trim());
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allowCustom && searchValue.trim()) {
      e.preventDefault();
      handleCustomValue();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <Search className="h-4 w-4 opacity-50" />
            {searchValue || placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && searchValue.trim() ? (
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Aucun résultat trouvé. Utiliser cette valeur ?
                  </p>
                  <Button
                    size="sm"
                    onClick={handleCustomValue}
                    className="w-full"
                  >
                    Utiliser "{searchValue}"
                  </Button>
                </div>
              ) : (
                <p className="p-2 text-sm text-muted-foreground">
                  Aucun résultat trouvé.
                </p>
              )}
            </CommandEmpty>
            {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
              <CommandGroup key={category} heading={category}>
                {categoryOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        searchValue === option.label ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 