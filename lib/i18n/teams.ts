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
  'Belgium': 'Bélgica',
  'Egypt': 'Egipto',
  'Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda',
  // Grupo H
  'Spain': 'España',
  'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudí',
  'Uruguay': 'Uruguay',
  // Grupo I
  'France': 'Francia',
  'Senegal': 'Senegal',
  'Iraq': 'Irak',
  'Norway': 'Noruega',
  // Grupo J
  'Argentina': 'Argentina',
  'Algeria': 'Argelia',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  // Grupo K
  'Portugal': 'Portugal',
  'DR Congo': 'RD Congo',
  'Uzbekistan': 'Uzbekistán',
  'Colombia': 'Colombia',
  // Grupo L
  'England': 'Inglaterra',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'Panama': 'Panamá',
}

export function teamEs(name: string): string {
  return TEAMS_ES[name] ?? name
}
