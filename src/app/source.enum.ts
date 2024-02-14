export enum Source {
  ia = 'ia',
  oas_online = 'oas_online'
}

export function isSource(x: any): x is Source {
  return Object.values(Source).includes(x as Source);
}