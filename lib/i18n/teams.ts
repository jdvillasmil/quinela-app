const TEAMS_ES: Record<string, string> = {
  // Grupo A
  'Mexico': 'México',
  'South Africa': 'Sudáfrica',
  'South Korea': 'Corea del Sur',
  'Czechia': 'Chequia',
  // Grupo B
  'Canada': 'Canadá',
  'Bosnia & Herzegovina': 'Bosnia y Herzegovina',
  'Qatar': 'Catar',
  'Switzerland': 'Suiza',
  // Grupo C
  'Brazil': 'Brasil',
  'Morocco': 'Marruecos',
  'Haiti': 'Haití',
  'Scotland': 'Escocia',
  // Grupo D
  'United States': 'Estados Unidos',
  'Paraguay': 'Paraguay',
  'Australia': 'Australia',
  'Türkiye': 'Turquía',
  // Grupo E
  'Germany': 'Alemania',
  'Curaçao': 'Curazao',
  'Ivory Coast': 'Costa de Marfil',
  'Ecuador': 'Ecuador',
  // Grupo F
  'Netherlands': 'Países Bajos',
  'Japan': 'Japón',
  'Sweden': 'Suecia',
  'Tunisia': 'Túnez',
  // Grupo G
  'France': 'Francia',
  'Nigeria': 'Nigeria',
  'Iraq': 'Irak',
  // Grupo H
  'Spain': 'España',
  'Colombia': 'Colombia',
  // Grupo I
  'Italy': 'Italia',
  'Denmark': 'Dinamarca',
  'Saudi Arabia': 'Arabia Saudita',
  'Benin': 'Benín',
  // Grupo J
  'Belgium': 'Bélgica',
  'Chile': 'Chile',
  'Algeria': 'Argelia',
  'Jamaica': 'Jamaica',
  // Grupo K
  'Portugal': 'Portugal',
  'Ghana': 'Ghana',
  'Uruguay': 'Uruguay',
  'Iceland': 'Islandia',
  // Grupo L
  'Argentina': 'Argentina',
  'Ukraine': 'Ucrania',
  'Cameroon': 'Camerún',
  'New Zealand': 'Nueva Zelanda',
}

export function teamEs(name: string): string {
  return TEAMS_ES[name] ?? name
}
