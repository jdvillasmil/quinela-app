const FLAGS: Record<string, string> = {
  // Grupo A
  'Mexico': 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Czechia': 'cz',
  // Grupo B
  'Canada': 'ca',
  'Bosnia & Herzegovina': 'ba',
  'Qatar': 'qa',
  'Switzerland': 'ch',
  // Grupo C
  'Brazil': 'br',
  'Morocco': 'ma',
  'Haiti': 'ht',
  'Scotland': 'gb-sct',
  // Grupo D
  'United States': 'us',
  'Paraguay': 'py',
  'Australia': 'au',
  'Türkiye': 'tr',
  // Grupo E
  'Germany': 'de',
  'Curaçao': 'cw',
  'Ivory Coast': 'ci',
  'Ecuador': 'ec',
  // Grupo F
  'Netherlands': 'nl',
  'Japan': 'jp',
  'Sweden': 'se',
  'Tunisia': 'tn',
  // Grupo G
  'Belgium': 'be',
  'Egypt': 'eg',
  'Iran': 'ir',
  'New Zealand': 'nz',
  // Grupo H
  'Spain': 'es',
  'Cape Verde': 'cv',
  'Saudi Arabia': 'sa',
  'Uruguay': 'uy',
  // Grupo I
  'France': 'fr',
  'Senegal': 'sn',
  'Iraq': 'iq',
  'Norway': 'no',
  // Grupo J
  'Argentina': 'ar',
  'Algeria': 'dz',
  'Austria': 'at',
  'Jordan': 'jo',
  // Grupo K
  'Portugal': 'pt',
  'DR Congo': 'cd',
  'Uzbekistan': 'uz',
  'Colombia': 'co',
  // Grupo L
  'England': 'gb-eng',
  'Croatia': 'hr',
  'Ghana': 'gh',
  'Panama': 'pa',
}

export function flagCode(team: string): string | null {
  return FLAGS[team] ?? null
}
