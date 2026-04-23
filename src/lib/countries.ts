// ISO country code → { name (multilingual), flag emoji }
// Compact list of common countries; emoji works as flag everywhere.

export interface Country {
  code: string;
  flag: string;
  names: { en: string; ar: string; fr: string; de: string };
}

export const COUNTRIES: Country[] = [
  { code: "EG", flag: "🇪🇬", names: { en: "Egypt", ar: "مصر", fr: "Égypte", de: "Ägypten" } },
  { code: "SA", flag: "🇸🇦", names: { en: "Saudi Arabia", ar: "السعودية", fr: "Arabie saoudite", de: "Saudi-Arabien" } },
  { code: "AE", flag: "🇦🇪", names: { en: "UAE", ar: "الإمارات", fr: "Émirats arabes unis", de: "VAE" } },
  { code: "MA", flag: "🇲🇦", names: { en: "Morocco", ar: "المغرب", fr: "Maroc", de: "Marokko" } },
  { code: "DZ", flag: "🇩🇿", names: { en: "Algeria", ar: "الجزائر", fr: "Algérie", de: "Algerien" } },
  { code: "TN", flag: "🇹🇳", names: { en: "Tunisia", ar: "تونس", fr: "Tunisie", de: "Tunesien" } },
  { code: "JO", flag: "🇯🇴", names: { en: "Jordan", ar: "الأردن", fr: "Jordanie", de: "Jordanien" } },
  { code: "LB", flag: "🇱🇧", names: { en: "Lebanon", ar: "لبنان", fr: "Liban", de: "Libanon" } },
  { code: "SY", flag: "🇸🇾", names: { en: "Syria", ar: "سوريا", fr: "Syrie", de: "Syrien" } },
  { code: "IQ", flag: "🇮🇶", names: { en: "Iraq", ar: "العراق", fr: "Irak", de: "Irak" } },
  { code: "PS", flag: "🇵🇸", names: { en: "Palestine", ar: "فلسطين", fr: "Palestine", de: "Palästina" } },
  { code: "KW", flag: "🇰🇼", names: { en: "Kuwait", ar: "الكويت", fr: "Koweït", de: "Kuwait" } },
  { code: "QA", flag: "🇶🇦", names: { en: "Qatar", ar: "قطر", fr: "Qatar", de: "Katar" } },
  { code: "BH", flag: "🇧🇭", names: { en: "Bahrain", ar: "البحرين", fr: "Bahreïn", de: "Bahrain" } },
  { code: "OM", flag: "🇴🇲", names: { en: "Oman", ar: "عُمان", fr: "Oman", de: "Oman" } },
  { code: "YE", flag: "🇾🇪", names: { en: "Yemen", ar: "اليمن", fr: "Yémen", de: "Jemen" } },
  { code: "SD", flag: "🇸🇩", names: { en: "Sudan", ar: "السودان", fr: "Soudan", de: "Sudan" } },
  { code: "LY", flag: "🇱🇾", names: { en: "Libya", ar: "ليبيا", fr: "Libye", de: "Libyen" } },
  { code: "TR", flag: "🇹🇷", names: { en: "Turkey", ar: "تركيا", fr: "Turquie", de: "Türkei" } },
  { code: "IR", flag: "🇮🇷", names: { en: "Iran", ar: "إيران", fr: "Iran", de: "Iran" } },
  { code: "PK", flag: "🇵🇰", names: { en: "Pakistan", ar: "باكستان", fr: "Pakistan", de: "Pakistan" } },
  { code: "IN", flag: "🇮🇳", names: { en: "India", ar: "الهند", fr: "Inde", de: "Indien" } },
  { code: "ID", flag: "🇮🇩", names: { en: "Indonesia", ar: "إندونيسيا", fr: "Indonésie", de: "Indonesien" } },
  { code: "MY", flag: "🇲🇾", names: { en: "Malaysia", ar: "ماليزيا", fr: "Malaisie", de: "Malaysia" } },
  { code: "US", flag: "🇺🇸", names: { en: "United States", ar: "أمريكا", fr: "États-Unis", de: "USA" } },
  { code: "GB", flag: "🇬🇧", names: { en: "United Kingdom", ar: "بريطانيا", fr: "Royaume-Uni", de: "Großbritannien" } },
  { code: "FR", flag: "🇫🇷", names: { en: "France", ar: "فرنسا", fr: "France", de: "Frankreich" } },
  { code: "DE", flag: "🇩🇪", names: { en: "Germany", ar: "ألمانيا", fr: "Allemagne", de: "Deutschland" } },
  { code: "IT", flag: "🇮🇹", names: { en: "Italy", ar: "إيطاليا", fr: "Italie", de: "Italien" } },
  { code: "ES", flag: "🇪🇸", names: { en: "Spain", ar: "إسبانيا", fr: "Espagne", de: "Spanien" } },
  { code: "PT", flag: "🇵🇹", names: { en: "Portugal", ar: "البرتغال", fr: "Portugal", de: "Portugal" } },
  { code: "NL", flag: "🇳🇱", names: { en: "Netherlands", ar: "هولندا", fr: "Pays-Bas", de: "Niederlande" } },
  { code: "BE", flag: "🇧🇪", names: { en: "Belgium", ar: "بلجيكا", fr: "Belgique", de: "Belgien" } },
  { code: "CH", flag: "🇨🇭", names: { en: "Switzerland", ar: "سويسرا", fr: "Suisse", de: "Schweiz" } },
  { code: "AT", flag: "🇦🇹", names: { en: "Austria", ar: "النمسا", fr: "Autriche", de: "Österreich" } },
  { code: "SE", flag: "🇸🇪", names: { en: "Sweden", ar: "السويد", fr: "Suède", de: "Schweden" } },
  { code: "NO", flag: "🇳🇴", names: { en: "Norway", ar: "النرويج", fr: "Norvège", de: "Norwegen" } },
  { code: "DK", flag: "🇩🇰", names: { en: "Denmark", ar: "الدنمارك", fr: "Danemark", de: "Dänemark" } },
  { code: "FI", flag: "🇫🇮", names: { en: "Finland", ar: "فنلندا", fr: "Finlande", de: "Finnland" } },
  { code: "PL", flag: "🇵🇱", names: { en: "Poland", ar: "بولندا", fr: "Pologne", de: "Polen" } },
  { code: "RU", flag: "🇷🇺", names: { en: "Russia", ar: "روسيا", fr: "Russie", de: "Russland" } },
  { code: "UA", flag: "🇺🇦", names: { en: "Ukraine", ar: "أوكرانيا", fr: "Ukraine", de: "Ukraine" } },
  { code: "GR", flag: "🇬🇷", names: { en: "Greece", ar: "اليونان", fr: "Grèce", de: "Griechenland" } },
  { code: "CA", flag: "🇨🇦", names: { en: "Canada", ar: "كندا", fr: "Canada", de: "Kanada" } },
  { code: "MX", flag: "🇲🇽", names: { en: "Mexico", ar: "المكسيك", fr: "Mexique", de: "Mexiko" } },
  { code: "BR", flag: "🇧🇷", names: { en: "Brazil", ar: "البرازيل", fr: "Brésil", de: "Brasilien" } },
  { code: "AR", flag: "🇦🇷", names: { en: "Argentina", ar: "الأرجنتين", fr: "Argentine", de: "Argentinien" } },
  { code: "CL", flag: "🇨🇱", names: { en: "Chile", ar: "تشيلي", fr: "Chili", de: "Chile" } },
  { code: "JP", flag: "🇯🇵", names: { en: "Japan", ar: "اليابان", fr: "Japon", de: "Japan" } },
  { code: "KR", flag: "🇰🇷", names: { en: "South Korea", ar: "كوريا الجنوبية", fr: "Corée du Sud", de: "Südkorea" } },
  { code: "CN", flag: "🇨🇳", names: { en: "China", ar: "الصين", fr: "Chine", de: "China" } },
  { code: "AU", flag: "🇦🇺", names: { en: "Australia", ar: "أستراليا", fr: "Australie", de: "Australien" } },
  { code: "ZA", flag: "🇿🇦", names: { en: "South Africa", ar: "جنوب أفريقيا", fr: "Afrique du Sud", de: "Südafrika" } },
  { code: "NG", flag: "🇳🇬", names: { en: "Nigeria", ar: "نيجيريا", fr: "Nigeria", de: "Nigeria" } },
];

export function getCountry(code?: string | null): Country | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code.toUpperCase());
}

export function flagOf(code?: string | null): string {
  return getCountry(code)?.flag ?? "🏳️";
}

// Extract flag from a nickname like "🇪🇬 Mohamed" → "🇪🇬"
export function extractFlag(nickname?: string | null): string | null {
  if (!nickname) return null;
  // First grapheme cluster — flag emojis are 2 regional indicator codepoints (8 bytes UTF-16 ≈ 4 chars)
  const m = nickname.match(/^(\p{RI}\p{RI})/u);
  return m ? m[1] : null;
}

// Strip leading flag from nickname for display when we render the flag separately.
export function stripFlag(nickname?: string | null): string {
  if (!nickname) return "";
  return nickname.replace(/^(\p{RI}\p{RI})\s*/u, "");
}

// Geographic neighbors used by AI opponent to pick a "nearby" country
export const NEIGHBORS: Record<string, string[]> = {
  EG: ["SA", "LY", "SD", "JO", "PS"],
  SA: ["EG", "AE", "KW", "QA", "BH", "OM", "YE"],
  AE: ["SA", "OM", "QA"],
  MA: ["DZ", "TN", "ES"],
  DZ: ["MA", "TN", "LY"],
  TN: ["DZ", "LY", "IT"],
  JO: ["SA", "PS", "SY", "IQ", "EG"],
  LB: ["SY", "PS", "JO"],
  SY: ["LB", "JO", "IQ", "TR"],
  IQ: ["SY", "JO", "SA", "IR", "KW", "TR"],
  PS: ["EG", "JO", "LB"],
  KW: ["SA", "IQ"],
  QA: ["SA", "AE"],
  BH: ["SA", "QA"],
  OM: ["SA", "AE", "YE"],
  YE: ["SA", "OM"],
  SD: ["EG", "LY"],
  LY: ["EG", "TN", "DZ", "SD"],
  TR: ["GR", "SY", "IQ", "IR"],
  IR: ["IQ", "TR", "PK"],
  PK: ["IR", "IN"],
  IN: ["PK"],
  FR: ["BE", "DE", "CH", "IT", "ES"],
  DE: ["FR", "BE", "NL", "AT", "CH", "PL", "DK"],
  IT: ["FR", "CH", "AT", "TN"],
  ES: ["FR", "PT", "MA"],
  GB: ["FR", "BE", "NL"],
  US: ["CA", "MX"],
};
