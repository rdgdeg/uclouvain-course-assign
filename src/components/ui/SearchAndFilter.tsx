import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedFaculty: string;
  setSelectedFaculty: (value: string) => void;
  faculties: string[];
}

export const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  selectedFaculty,
  setSelectedFaculty,
  faculties
}: SearchAndFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher un cours par titre ou code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Toutes les facultés" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les facultés</SelectItem>
          {faculties.map((faculty) => (
            <SelectItem key={faculty} value={faculty}>
              {faculty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};