import { Pipe, PipeTransform } from '@angular/core';
import { ClientSource } from './source.enum';

@Pipe({
  name: 'sourceRenderPipe',
  standalone: true
})
export class SourceRenderPipe implements PipeTransform {
  constructor() { }

  transform(value: string, ...args: any[]): string {
    console.log('value', value);
    switch (value) {
      case ClientSource.ia:
        return $localize`:@@source.ia:IA`;
      case ClientSource.oas_online:
        return $localize`:@@source.oas_online:OAS Online`;
      default:
        return value;
    }
  }

}
