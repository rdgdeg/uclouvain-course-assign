
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react";
import { FACULTY_OPTIONS, getSchoolsForFaculty } from "@/utils/constants";

interface AdminFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFaculty: string;
  onFacultyChange: (faculty: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedSchool: string;
  onSchoolChange: (school: string) => void;
  selectedVolumeValidation: string;
  onVolumeValidationChange: (validation: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export const AdminFilters = ({
  searchTerm,
  onSearchChange,
  selectedFaculty,
  onFacultyChange,
  selectedStatus,
  onStatusChange,
  selectedSchool,
  onSchoolChange,
  selectedVolumeValidation,
  onVolumeValidationChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters
}: AdminFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [selectedFaculty, selectedStatus, selectedSchool, selectedVolumeValidation].filter(f => f !== 'all').length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, code, ou enseignant..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 pt-4 border-t">
              <Select value={selectedFaculty} onValueChange={onFacultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les facultés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les facultés</SelectItem>
                  {FACULTY_OPTIONS.map(faculty => (
                    <SelectItem key={faculty.value} value={faculty.value}>
                      {faculty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="assigned">Attribué</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="issues">Avec problèmes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSchool} onValueChange={onSchoolChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les écoles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les écoles</SelectItem>
                  {selectedFaculty !== "all" && getSchoolsForFaculty(selectedFaculty).map(school => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedVolumeValidation} onValueChange={onVolumeValidationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Volume valide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="valid">Volume valide</SelectItem>
                  <SelectItem value="invalid">Volume invalide</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Titre</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="faculty">Faculté</SelectItem>
                  <SelectItem value="subcategory">Sous-catégorie</SelectItem>
                  <SelectItem value="status">Statut</SelectItem>
                  <SelectItem value="start_date">Date de début</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
