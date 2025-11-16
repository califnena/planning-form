import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-[160px] h-10 text-base border-2 hover:border-primary/50 transition-colors bg-background">
          <SelectValue>
            {currentLanguage?.nativeName || "Select Language"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background border-2 shadow-lg z-50">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="text-base py-3 cursor-pointer hover:bg-accent focus:bg-accent"
            >
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-muted-foreground ml-2 text-sm">({lang.name})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
