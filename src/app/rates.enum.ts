export interface Rates {
    pension: number;              // OAS Pension
    pension75?: number;           // OAS Pension (Age 75 and Over)
    gisSingle: number;            // GIS Single
    gisSingleEn?: number;         // GIS Single Enhancement
    gisMarToPen: number;          // GIS Married/C-L to Pensioner
    gisMarToPenEn?: number;       // GIS Married/C-L to Pensioner Enhancement
    gisMarToNonPen: number;       // GIS Married/C-L to Non-Pensioner
    gisMarToNonPenEn?: number;    // GIS Married/C-L to Non-Pensioner Enhancement
    gisMarToAllowRcpt: number;    // GIS Married/C-L to Allowance Recipient
    gisMarToAllowRcptEn?: number; // GIS Married/C-L to Allowance Recipient Enhancement
    allow: number;                // Allowance
    allowEn?: number;             // Allowance Enhancement
    allowSurvior?: number;        // Allowance for the Survivor
    allowSurviorEn?: number;      // Allowance for the Survivor Enhancement
}