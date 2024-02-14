export enum Benefit {
    oas = 'oas',
    gis = 'gis',
    oas_gis = 'oas+gis',
    alw = 'alw',
    alws = 'alws'
  }
  
  export function isBenefit(x: any): x is Benefit {
    return Object.values(Benefit).includes(x as Benefit);
  }