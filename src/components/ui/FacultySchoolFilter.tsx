import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FACULTY_OPTIONS, getSchoolsForFaculty } from "@/utils/constants";

interface FacultySchoolFilterProps {
  facultyFilter: string;
  onFacultyChange: (faculty: string) => void;
  schoolFilter: string;
  onSchoolChange: (school: string) => void;
  className?: string;
}

export const FacultySchoolFilter = ({
  facultyFilter,
  onFacultyChange,
  schoolFilter,
  onSchoolChange,
  className = ""
}: FacultySchoolFilterProps) => {
  const getSchoolOptions = () => {
    if (facultyFilter === "all") return [];
    return getSchoolsForFaculty(facultyFilter);
  };

  const handleFacultyChange = (value: string) => {
    onFacultyChange(value);
    onSchoolChange("all"); // Réinitialiser le filtre école quand la faculté change
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      <Select value={facultyFilter} onValueChange={handleFacultyChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Faculté" />
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

      {getSchoolOptions().length > 0 && (
        <Select value={schoolFilter} onValueChange={onSchoolChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="École" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les écoles</SelectItem>
            {getSchoolOptions().map(school => (
              <SelectItem key={school} value={school}>
                {school}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}; 