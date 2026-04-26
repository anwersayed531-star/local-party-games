// Human-like names per language to make the AI opponent indistinguishable.
// Given a real player nickname, we pick a similar-sounding fake.

const ARABIC_NAMES = [
  "أحمد", "محمد", "محمود", "حمادة", "علي", "حسن", "حسين", "كريم", "خالد", "طارق",
  "يوسف", "إبراهيم", "مصطفى", "سامي", "أمير", "عمر", "زياد", "هاني", "وائل", "ماهر",
  "سارة", "ندى", "رنا", "هند", "منى", "ياسمين", "نور", "ليلى", "دينا", "هبة",
  "عبدالله", "عبدالرحمن", "بلال", "رامي", "فادي", "أنس", "زين", "جمال", "نبيل", "فهد",
];

const ENGLISH_NAMES = [
  "Alex", "Sam", "Chris", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Drew",
  "Mike", "Dave", "John", "James", "Ryan", "Kevin", "Brian", "Mark", "Steve", "Paul",
  "Sara", "Sandra", "Sally", "Emma", "Olivia", "Mia", "Lily", "Anna", "Kate", "Lisa",
  "Tom", "Tim", "Ben", "Dan", "Nick", "Luke", "Jack", "Liam", "Noah", "Ethan",
];

const FRENCH_NAMES = [
  "Pierre", "Paul", "Patrick", "Jean", "Luc", "Marc", "Antoine", "Julien", "Nicolas", "Thomas",
  "Hugo", "Léo", "Mathieu", "Olivier", "Vincent", "François", "Philippe", "Michel", "Gabriel", "Louis",
  "Marie", "Sophie", "Camille", "Léa", "Manon", "Chloé", "Inès", "Emma", "Julie", "Pauline",
];

const GERMAN_NAMES = [
  "Hans", "Klaus", "Stefan", "Michael", "Thomas", "Andreas", "Markus", "Jonas", "Felix", "Lukas",
  "Maximilian", "Sebastian", "Tobias", "Florian", "Daniel", "Fabian", "Christian", "Matthias", "Niklas", "Jan",
  "Anna", "Lena", "Sophie", "Marie", "Laura", "Lisa", "Julia", "Sarah", "Hannah", "Mia",
];

function detectLang(name: string): "ar" | "en" | "fr" | "de" {
  // Arabic codepoints
  if (/[\u0600-\u06FF]/.test(name)) return "ar";
  // German umlauts
  if (/[äöüßÄÖÜ]/.test(name)) return "de";
  // French accents
  if (/[éèêëàâçîïôûùÿœæ]/i.test(name)) return "fr";
  return "en";
}

function pool(lang: "ar" | "en" | "fr" | "de"): string[] {
  switch (lang) {
    case "ar": return ARABIC_NAMES;
    case "fr": return FRENCH_NAMES;
    case "de": return GERMAN_NAMES;
    default: return ENGLISH_NAMES;
  }
}

// Pick a fake name in a specified language family (or auto-detect from nickname).
export function generateAiName(
  playerNickname: string,
  forceLang?: "ar" | "en" | "fr" | "de"
): { name: string; lang: "ar" | "en" | "fr" | "de" } {
  // Strip leading flag if present
  const clean = playerNickname.replace(/^(\p{RI}\p{RI})\s*/u, "").trim();
  const lang = forceLang ?? detectLang(clean);
  const list = pool(lang);
  let pick = list[Math.floor(Math.random() * list.length)];
  let attempts = 0;
  while (pick.toLowerCase() === clean.toLowerCase() && attempts < 5) {
    pick = list[Math.floor(Math.random() * list.length)];
    attempts++;
  }
  return { name: pick, lang };
}
