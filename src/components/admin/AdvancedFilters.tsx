import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  X, 
  RefreshCw, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Save,
  Loader2
} from "lucide-react";

interface AdvancedFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFaculty: string;
  setSelectedFaculty: (faculty: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  selectedVolumeValidation: string;
  setSelectedVolumeValidation: (validation: string) => void;
  faculties: string[];
  subcategories: string[];
  onClearFilters: () => void;
  onSaveFilters?: () => void;
  onLoadFilters?: () => void;
}

export const AdvancedFilters = ({
  searchTerm,
  setSearchTerm,
  selectedFaculty,
  setSelectedFaculty,
  selectedStatus,
  setSelectedStatus,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedVolumeValidation,
  setSelectedVolumeValidation,
  faculties,
  subcategories,
  onClearFilters,
  onSaveFilters,
  onLoadFilters
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClearFilters = () => {
    setIsLoading(true);
    onClearFilters();
    setTimeout(() => setIsLoading(false), 500);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedFaculty !== "all",
    selectedStatus !== "all",
    selectedSubcategory !== "all",
    selectedVolumeValidation !== "all"
  ].filter(Boolean).length;

  const statusOptions = [
    { value: "all", label: "Tous les statuts", icon: BookOpen },
    { value: "vacant", label: "Cours vacants", icon: AlertTriangle },
    { value: "assigned", label: "Cours attribués", icon: CheckCircle },
    { value: "pending", label: "En attente", icon: Clock },
  ];

  const volumeValidationOptions = [
    { value: "all", label: "Toutes les validations" },
    { value: "valid", label: "Volume validé" },
    { value: "invalid", label: "Volume incorrect" },
  ];

  return (
    <Card className="border-2 border-gray-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres avancés
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtres de base toujours visibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Faculté */}
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une faculté" />
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

          {/* Statut */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Filtres avancés (expandables) */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sous-catégorie */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sous-catégorie
                </label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une sous-catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validation des volumes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Validation des volumes
                </label>
                <Select value={selectedVolumeValidation} onValueChange={setSelectedVolumeValidation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type de validation" />
                  </SelectTrigger>
                  <SelectContent>
                    {volumeValidationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options avancées */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Options avancées</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-only-urgent" />
                  <label htmlFor="show-only-urgent" className="text-sm text-gray-600">
                    Cours urgents uniquement
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-with-issues" />
                  <label htmlFor="show-with-issues" className="text-sm text-gray-600">
                    Avec problèmes de validation
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading || activeFiltersCount === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Effacer les filtres
            </Button>
            
            {onSaveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveFilters}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            )}
            
            {onLoadFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadFilters}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Charger
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-500">
            {activeFiltersCount > 0 && (
              <span>
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 