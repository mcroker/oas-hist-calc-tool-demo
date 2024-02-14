import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'financialYearRenderPipe',
  standalone: true
})
export class FinancialYearRenderPipe implements PipeTransform {
  constructor() { }

  transform(year: any, ...args: any[]): any {
    if (typeof year === 'number') {
      return `${year}/${String(year + 1).substring(2)}`;
    } else {
      return year;
    }
  }
}
