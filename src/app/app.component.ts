import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAnglesDown } from '@fortawesome/free-solid-svg-icons';
import { Benefit, isBenefit } from './benefit.enum';
import { Source, isSource } from './source.enum';
import { BenefitRenderPipe } from './benefit.pipe';
import { SourceRenderPipe } from './source.pipe';
import { MaritalStatus } from './marital.enum';
import { BenefitCalcService } from './benefit-calc.service';
import { dateToString, priorFinancialYear } from './utils';
import { Period } from './period.interface';
import { FinancialYearRenderPipe } from './financialyear.pipe';

interface PeriodFormGroup {
  date: FormControl<Date | null>;
  oasInitial: FormControl<number | null>;
}

interface IncomeFormGroup {
  financialYear: FormControl<number | null>;
  netIncome: FormControl<number | null>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    BenefitRenderPipe,
    SourceRenderPipe,
    FinancialYearRenderPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  readonly Benefit = Benefit;
  readonly benefits = Object.values(Benefit);
  readonly Source = Source;
  readonly sources = Object.values(Source);
  readonly faAnglesDown = faAnglesDown;
  readonly offset = new Date().getTimezoneOffset();

  public inputForm = this.fb.group({
    startDate: '2024-01',
    endDate: '2024-03',
    dob: '1949-01-01',
    actuariallyAdjustedMonths: 0,
    fortieths: 40,
    rateTable: 35,
    maritalStatus: MaritalStatus.single,
    sqf: 0,
    source: Source.oas_online,
    benefit: Benefit.oas,
  });

  public periodForm = this.fb.group({
    incomes: new FormArray<FormGroup<IncomeFormGroup>>([]),
    periods: new FormArray<FormGroup<PeriodFormGroup>>([])
  });

  get periodGroups(): FormArray<FormGroup<PeriodFormGroup>> {
    return this.periodForm.get('periods') as FormArray;
  }

  get incomeGroups(): FormArray<FormGroup<IncomeFormGroup>> {
    return this.periodForm.get('incomes') as FormArray;
  }

  private periodGroupMap: { [date: string]: FormGroup<PeriodFormGroup> } = {};
  private incomeGroupMap: { [year: number]: FormGroup<IncomeFormGroup> } = {};

  get source(): Source {
    if (isSource(this.inputForm.value.source)) {
      return this.inputForm.value.source;
    } else {
      throw new Error('Source is invalid');
    }
  }

  get benefit(): Benefit {
    if (isBenefit(this.inputForm.value.benefit)) {
      return this.inputForm.value.benefit;
    } else {
      throw new Error('Benefit is invalid');
    }
  }

  get numPeriods(): number {
    return this.periodForm.controls.periods.controls.length;
  }

  get numIncomes(): number {
    return this.periodForm.controls.incomes.controls.length;
  }

  private get startDate(): Date | null {
    if (this.inputForm.value.startDate === undefined || this.inputForm.value.startDate === null) {
      return null;
    }
    const date = new Date(this.inputForm.value.startDate);
    if (isNaN(date.getTime())) {
      return null;
    }
    date.setMinutes(date.getMinutes() + this.offset);
    return date;
  }

  private get endDate(): Date | null {
    if (this.inputForm.value.endDate === undefined || this.inputForm.value.endDate === null) {
      return null;
    }
    const date = new Date(this.inputForm.value.endDate);
    if (isNaN(date.getTime())) {
      return null;
    }
    date.setMinutes(date.getMinutes() + this.offset);
    return date;
  }

  private get dob(): Date | null {
    if (this.inputForm.value.dob === undefined || this.inputForm.value.dob === null) {
      return null;
    }
    const date = new Date(this.inputForm.value.dob);
    if (isNaN(date.getTime())) {
      return null;
    }
    date.setMinutes(date.getMinutes() + this.offset);
    return date;
  }

  private get actuariallyAdjustedMonths(): number | null {
    if (this.inputForm.value.actuariallyAdjustedMonths === undefined || this.inputForm.value.actuariallyAdjustedMonths === null) {
      return null;
    }
    return this.inputForm.value.actuariallyAdjustedMonths;
  }

  private get fortieths(): number | null {
    if (this.inputForm.value.fortieths === undefined || this.inputForm.value.fortieths === null) {
      return null;
    }
    return this.inputForm.value.fortieths;
  }

  constructor(
    private fb: FormBuilder,
    private benefitCalcService: BenefitCalcService
  ) {
    // empty
  }

  ngOnInit() {
    wet.builder.setup({
      cdnEnv: "prod",
      base: {
        exitSecureSite: { exitScript: true, displayModal: true, exitMsg: "Don't you want to stay?" }
      },
      top: {
        "lngLinks": [
          { "lang": "fr", "text": "Français", "href": "/fr" },  // document.cookie = "firebase-country-override=ca";
          { "lang": "en", "text": "English", "href": "/en" }
        ],
        breadcrumbs: [
          { title: $localize`:@@breadcrumbs.home:Home`, acronym: "GCintranet", href: "https://intranet.canada.ca/index-eng.asp" },
          { title: $localize`:@@breadcrumbs.tool:Historical Calc Tool` }
        ]
      },
      preFooter: {
        dateModified: "2022-05-25"
      }
    });

    this.createPeriodControls();

    this.inputForm.valueChanges.subscribe((value) => {
      this.createPeriodControls();
    });
  }

  private createPeriodControls() {
    const periodsInRange = this.periodsInRange();

    // Income
    const priorYears = [...new Set(periodsInRange.map(priorFinancialYear))];
    this.periodForm.controls.incomes.clear();
    for (const financialYear of priorYears) {
      if (this.incomeGroupMap[financialYear] === undefined) {
        this.incomeGroupMap[financialYear] = this.fb.group({
          financialYear,
          netIncome: new FormControl<number | null>(null)
        });
      }
      this.periodForm.controls.incomes.push(this.incomeGroupMap[financialYear]);
    }

    // Periods
    this.periodForm.controls.periods.clear();
    for (const period of periodsInRange) {
      const key = dateToString(period)
      if (this.periodGroupMap[key] === undefined) {
        this.periodGroupMap[key] = this.fb.group({
          date: period,
          oasInitial: new FormControl<number | null>(null)
        });
      }
      this.periodForm.controls.periods.push(this.periodGroupMap[key]);
    }
  }

  periodsInRange(): Date[] {
    const periods: Date[] = [];
    const date = this.startDate;
    const endDate = this.endDate;
    if (date && endDate) {
      while (date <= endDate) {
        periods.push(new Date(date));
        date.setMonth(date.getMonth() + 1);
      }
    }
    return periods;
  }

  private periodValues(): Period[] {
    return (this.periodForm.value.periods || [])
      .map((period) => {
        if (period.date === undefined || period.date === null) {
          throw new Error('Period date is undefined');
        }
        return {
          date: period.date,
          oasInitial: (undefined !== period.oasInitial) ? period.oasInitial : null
        };
      });
  }

  copyOasInitialToEnd(i: number) {
    this.periodForm.controls.periods.controls
      .filter((control, index) => (index >= i))
      .forEach((control) => {
        control.patchValue({ oasInitial: this.periodForm.controls.periods.controls[i].value.oasInitial });
      });
  }

  oasRateCalc(date: Date | undefined | null): number | null {
    if (date === undefined || date === null) {
      return null;
    }

    const actuariallyAdjustedMonths = this.actuariallyAdjustedMonths;
    const fortieths = this.fortieths;
    const dob = this.dob;
    if (actuariallyAdjustedMonths === null || fortieths === null || dob === null) {
      return null;
    }

    return this.benefitCalcService.oasRateCalc({ date, dob, actuariallyAdjustedMonths, fortieths });
  }

  sumOas(): number | null {
    const oasRates = this.periodValues().map((period) => this.oasRateCalc(period.date))
    if (oasRates.every((rate) => (typeof rate === 'number'))) {
      return (oasRates as number[]).reduce((acc, oasRate) => acc + (oasRate || 0), 0);
    } else {
      return null;
    }
  }

  sumOasInitial(): number | null {
    const periodValues = this.periodValues();
    if (!periodValues.every((period) => typeof period.oasInitial === 'number')) {
      return null;
    }
    return (periodValues as (Period & { oasInitial: number })[])
      .reduce((acc, period) => acc + period.oasInitial, 0);
  }

  actionsRequired(): string[] | null {
    const oasSum = this.sumOas();
    const oasInitialSum = this.sumOasInitial();
    if (oasSum === null || oasInitialSum === null) {
      return null;
    }
    return this.benefitCalcService.actionsRequired({
      benefit: this.benefit,
      source: this.source,
      oasSum,
      oasInitialSum,
      numPeriods: this.numPeriods
    });
  }

  consoleLog(x: any) {
    console.log(x);
  }

}
