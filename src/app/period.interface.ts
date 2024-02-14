export interface Period {
    date: Date;
    oasInitial: number | null;
}

export interface PeriodWithOasInitial extends Period {
    oasInitial: number;
}