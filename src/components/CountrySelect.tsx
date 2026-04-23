import { useTranslation } from "react-i18next";
import { COUNTRIES } from "@/lib/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export default function CountrySelect({ value, onChange }: Props) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "en").slice(0, 2) as "en" | "ar" | "fr" | "de";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("auth.selectCountry")} />
      </SelectTrigger>
      <SelectContent className="max-h-72 bg-popover">
        {COUNTRIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="me-2">{c.flag}</span>
            {c.names[lang] ?? c.names.en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
