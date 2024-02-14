import { Pipe, PipeTransform } from '@angular/core';
import { Source } from './source.enum';

@Pipe({
  name: 'sourceRenderPipe',
  standalone: true
})
export class SourceRenderPipe implements PipeTransform {
  constructor() { }

  transform(value: string, ...args: any[]): string {
    switch (value) {
      case Source.ia:
        return $localize`:@@source.ia:IA`;
      case Source.oas_online:
        return $localize`:@@source.oas_online:OAS Online`;
      default:
        return value;
    }
  }

}
