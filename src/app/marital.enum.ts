export enum MaritalStatus {
  single = 'single',
  married_to_pensioner = 'married_to_pensioner',
  married_to_non_pensioner = 'married_to_non_pensioner',
  married_to_allowance_recpient = 'married_to_allowance_recpient',
}

export function isMaritalStatus(x: any): x is MaritalStatus {
  return Object.values(MaritalStatus).includes(x)
}