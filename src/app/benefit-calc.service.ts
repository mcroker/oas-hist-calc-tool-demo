import { Injectable } from '@angular/core';
import { OAS_RATES } from './rates';
import { MaritalStatus } from './marital.enum';
import { dateToString, getAgeAt } from './utils';
import { Benefit } from './benefit.enum';
import { Source } from './source.enum';
import { Period } from './period.interface';

@Injectable({
  providedIn: 'root'
})
export class BenefitCalcService {

  constructor() { }

  oasRateCalc(input: {
    date: Date,
    dob: Date,
    actuariallyAdjustedMonths: number,
    fortieths: number
  }): number {
    const rates = OAS_RATES[dateToString(input.date)];
    if (rates === undefined) {
      throw Error('No rate table');
    }

    const age = getAgeAt(input.date, input.dob);
    if (age === undefined) {
      throw new Error('Unable to calculate age');
    }

    const oasMaxRate = (age >= 75)
      ? rates.pension75 || rates.pension
      : rates.pension;

    return oasMaxRate * (input.fortieths / 40) * (1 + (0.006 * input.actuariallyAdjustedMonths))
  }

  gisRateCalc(input: {
    date: Date,
    maritalStatus: MaritalStatus,
    netIncome: number,
    actuariallyAdjustedMonths: number,
    fortieths: number
  }): number {
    const rates = OAS_RATES[dateToString(input.date)];
    if (rates === undefined) {
      throw Error('No rate table');
    }

    const gisRate = (() => {
      switch (input.maritalStatus) {
        case MaritalStatus.single:
          return rates.gisSingle;
        case MaritalStatus.married_to_pensioner:
          return rates.gisMarToPen
        case MaritalStatus.married_to_non_pensioner:
          return rates.gisMarToNonPen;
        case MaritalStatus.married_to_allowance_recpient:
          return rates.gisMarToAllowRcpt;
      }
    })();

    const applicableIncome = input.netIncome

    return gisRate;
  }

  actionsRequired(input: {
    benefit: Benefit,
    source: Source,
    oasInitialSum: number,
    oasSum: number,
    numPeriods: number
  }): string[] {
    const actions: string[] = [];
    if (input.benefit === Benefit.oas || input.benefit === Benefit.oas_gis) {
      if (input.source === Source.oas_online) {
        const adjustment = Math.abs(input.oasInitialSum - input.oasSum).toFixed(2);
        actions.push(`Update Amount Override Value with New Amount \$${adjustment}`)
      } else if (input.source === Source.ia) {
        if (input.oasSum > input.oasInitialSum) {
          const adjustment = ((input.oasSum - input.oasInitialSum) / input.numPeriods).toFixed(2)
          actions.push(`Set Monthly Amount Override Value for \$${adjustment}`)
        } else {
          const adjustment = (input.oasInitialSum - input.oasSum).toFixed(2);
          actions.push(`Set Manual Overpayment Value for \$${adjustment}`)
        }
      }
    }
    if (actions.length === 0) {
      actions.push('No actions required');
    }
    return actions;
  }

}
