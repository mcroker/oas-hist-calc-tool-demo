import { Pipe, PipeTransform } from '@angular/core';
import { Benefit } from './benefit.enum';

@Pipe({
  name: 'benefitRenderPipe',
  standalone: true
})
export class BenefitRenderPipe implements PipeTransform {
  constructor() { }

  transform(value: string, ...args: any[]): string {
    switch (value) {
      case Benefit.oas:
        return $localize`:@@benefit.oas:OAS`;
      case Benefit.gis:
        return $localize`:@@benefit.gis:GIS`;
      case Benefit.oas_gis:
        return $localize`:@@benefit.oas_gis:OAS & GIS`;
      case Benefit.alw:
        return $localize`:@@benefit.alw:ALW`;
      case Benefit.alws:
        return $localize`:@@benefit.alws:ALWS`;
      default:
        return value;
    }
  }
}
