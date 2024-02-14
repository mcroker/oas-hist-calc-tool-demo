import { Pipe, PipeTransform } from '@angular/core';
import { MaritalStatus } from './marital.enum';

@Pipe({
  name: 'maritalStatusRenderPipe',
  standalone: true
})
export class MaritalStatusRenderPipe implements PipeTransform {
  constructor() { }

  transform(value: string, ...args: any[]): string {
    switch (value) {
      case MaritalStatus.single:
        return $localize`:@@marital.single:Single`;
      case MaritalStatus.married_to_pensioner:
        return $localize`:@@marital.marToPen:Married to Pensioner`;
      case MaritalStatus.married_to_non_pensioner:
        return $localize`:@@marital.marToNonPen:Married to Non-Pensioner`;
      case MaritalStatus.married_to_allowance_recpient:
        return $localize`:@@marital.marToAllowRcpt:Married to Allowance Recipient`
      default:
        return value;
    }
  }

}
