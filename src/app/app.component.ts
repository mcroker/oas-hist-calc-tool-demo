import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { OAS_RATES } from './rates';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAnglesDown } from '@fortawesome/free-solid-svg-icons';
import { Benefit } from './benefit.enum';
import { ClientSource } from './source.enum';
import { BenefitRenderPipe } from './benefit.pipe';
import { SourceRenderPipe } from './source.pipe';

interface Period {
  date: Date | null | undefined;
  oasInitial: number | null | undefined;
}

interface PeriodFormGroup {
  date: FormControl<Date | null>;
  oasInitial: FormControl<number | null>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    BenefitRenderPipe,
    SourceRenderPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  readonly Benefit = Benefit;
  readonly benefits = Object.values(Benefit);
  readonly ClientSource = ClientSource;
  readonly clientSources = Object.values(ClientSource);
  readonly faAnglesDown = faAnglesDown;

  public inputForm = this.fb.group({
    startDate: ['2024-01'],
    endDate: ['2024-03'],
    dob: ['1949-01-01'],
    actuariallyAdjustedMonths: [0],
    fortieths: [40],
    rateTable: [35],
    netIncome: [0],
    sqf: [0],
    clientSource: [ClientSource.oas_online],
    benefit: [Benefit.oas]
  });

  public periodForm = this.fb.group({
    periods: new FormArray<FormGroup<PeriodFormGroup>>([])
  });

  get periodGroups(): FormArray<FormGroup<PeriodFormGroup>> {
    return this.periodForm.get('periods') as FormArray;
  }

  private periodGroupMap: { [date: string]: FormGroup } = {};

  get clientSource(): string | undefined | null {
    return this.inputForm.value.clientSource;
  }

  get benefit(): string | undefined | null {
    return this.inputForm.value.benefit;
  }

  get numPeriods(): number {
    return this.periodForm.controls.periods.controls.length;
  }

  constructor(private fb: FormBuilder) {
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
          { title: $localize `:@@breadcrumbs.home:Home`, acronym: "GCintranet", href: "https://intranet.canada.ca/index-eng.asp" },
          { title: $localize `:@@breadcrumbs.tool:Historical Calc Tool` }
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
    this.periodForm.controls.periods.clear();
    for (const period of this.periodsInRange()) {
      const key = this.dateToString(period)
      if (this.periodGroupMap[key] === undefined) {
        this.periodGroupMap[key] = this.fb.group({
          date: [period],
          oasInitial: [0]
        });
      }
      this.periodForm.controls.periods.push(this.periodGroupMap[key]);
    }
  }

  periodsInRange(): Date[] {
    const periods: Date[] = [];
    if (this.inputForm.value.startDate && this.inputForm.value.endDate) {
      const date = new Date(this.inputForm.value.startDate);
      while (date <= new Date(this.inputForm.value.endDate)) {
        periods.push(new Date(date));
        date.setMonth(date.getMonth() + 1);
      }
    }
    return periods;
  }

  periodValues(): Period[] {
    return (this.periodForm.value.periods || [])
      .map((period: Partial<Period>) => ({
        date: period.date,
        oasInitial: period.oasInitial || 0
      }));
  }

  copyToEnd(i: number) {
    this.periodForm.controls.periods.controls
      .filter((control, index) => (index >= i))
      .forEach((control) => {
        control.patchValue({ oasInitial: this.periodForm.controls.periods.controls[i].value.oasInitial });
      });
  }

  sumOas(): number {
    return this.periodValues()
      .map((period) => this.oasRateCalc(period.date) || 0)
      .reduce((acc, oasRate) => acc + (oasRate || 0), 0);
  }

  sumOasInitial(): number {
    return this.periodValues()
      .reduce((acc, period) => acc + (period.oasInitial || 0), 0);
  }

  actionsRequired(): string[] | undefined {
    const actions: string[] = [];
    if (this.benefit === Benefit.oas || this.benefit === Benefit.oas_gis) {
      const oasSum = this.sumOas();
      const oasInitialSum = this.sumOasInitial();
      if (this.clientSource === ClientSource.oas_online) {
        const adjustment = Math.abs(oasInitialSum - oasSum).toFixed(2);
        actions.push(`Update Amount Override Value with New Amount \$${adjustment}`)
      } else if (this.clientSource === ClientSource.ia) {
        if (oasSum > oasInitialSum) {
          const adjustment = ((oasSum - oasInitialSum) / this.numPeriods).toFixed(2)
          actions.push(`Set Monthly Amount Override Value for \$${adjustment}`)
        } else {
          const adjustment = (oasInitialSum - oasSum).toFixed(2);
          actions.push(`Set Manual Overpayment Value for \$${adjustment}`)
        }
      }
    }
    if (actions.length === 0) {
      actions.push('No actions required');
    }
    return actions;
  }

  oasRateCalc(date: Date | undefined | null): number | undefined {
    if (date === undefined || date === null) {
      return undefined;
    }
    const rates = OAS_RATES[this.dateToString(date)];
    if (rates === undefined) {
      throw Error('No rate table');
    }

    const age = this.getAgeAt(date);
    if (age === undefined
      || this.inputForm.value.actuariallyAdjustedMonths === undefined || this.inputForm.value.actuariallyAdjustedMonths === null
      || this.inputForm.value.fortieths === undefined || this.inputForm.value.fortieths === null
    ) {
      return undefined;
    }

    const oasMaxRate = (age >= 75)
      ? rates.pension75 || rates.pension
      : rates.pension;

    return oasMaxRate * (this.inputForm.value.fortieths / 40) * (1 + (0.006 * this.inputForm.value.actuariallyAdjustedMonths))
  }

  getAgeAt(date: Date): number | undefined {
    if (this.inputForm.value.dob === undefined || this.inputForm.value.dob === null) {
      return undefined;
    }
    const dob = new Date(this.inputForm.value.dob);
    if (dob === undefined || dob === null) {
      return undefined;
    }
    let currentYear = date.getFullYear();
    let birthYear = dob.getFullYear();
    let age = currentYear - birthYear;
    if (date < new Date(dob.setFullYear(currentYear))) {
      age = age - 1;
    }
    return age;
  }

  dateToString(date: Date): string {
    const d = date.toLocaleString("default", { day: "2-digit" });;
    const m = date.toLocaleString("default", { month: "2-digit" });
    const y = date.toLocaleString("default", { year: "numeric" });
    return `${y}-${m}-${d}`;
  }

  consoleLog(x: any) {
    console.log(x);
  }

}
