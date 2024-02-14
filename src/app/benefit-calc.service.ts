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
    oasIncome: number
  }): number {
    const rates = OAS_RATES[dateToString(input.date)];
    if (rates === undefined) {
      throw Error('No rate table');
    }

    const gisMaxRate = (() => {
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

    const applicableIncome = input.netIncome - input.oasIncome;

    const gisRate = Math.max(0, gisMaxRate - (applicableIncome / 2));
    return gisRate;

  }

  actionsRequired(input: {
    benefit: Benefit,
    source: Source,
    oasInitialSum: number | null,
    oasSum: number | null,
    gisInitialSum: number | null,
    gisSum: number | null,
    numPeriods: number
  }): string[] {
    const actions: string[] = [];
    if (input.benefit === Benefit.oas || input.benefit === Benefit.oas_gis) {
      if (input.oasInitialSum === null || input.oasSum === null) {
        actions.push('Complete form for OAS actions');
      } else {
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
    }
    if (input.benefit === Benefit.gis || input.benefit === Benefit.oas_gis) {
      if (input.gisInitialSum === null || input.gisSum === null) {
        actions.push('Complete form for GIS actions');
      } else {
        actions.push('Actions for GIS Adjustment not implemetned in the tool - panic!'); // TODO
      }
    }
    if (actions.length === 0) {
      actions.push('No actions required');
    }
    return actions;
  }

}
