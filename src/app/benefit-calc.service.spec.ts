import { TestBed } from '@angular/core/testing';

import { BenefitCalcService } from './benefit-calc.service';

describe('BenefitCalcService', () => {
  let service: BenefitCalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenefitCalcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
