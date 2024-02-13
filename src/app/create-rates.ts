import { promises } from 'fs';
import * as path from 'path';

export interface OASRate {
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

(async () => {
    const file = path.join(__dirname, 'rates.csv');
    const data = await promises.readFile(file, 'utf-8');
    const of = path.join(__dirname, 'rates.json');

    const outs: { [key: string]: Partial<OASRate> } = {};
    const d = data.split('\n').forEach((line) => {
        const l = line.split(/ *, */).map(s => String(s).replace(/\$-/g, '0').replace(/\$/g, '').replace(/"/g,'').trim());
        const date = l[0];
        const out: Partial<OASRate> = {};
        out.pension = parseFloat(l[1]);
        if (l[2] !== '') {
            out.pension75 = parseFloat(l[2]);
        }
        out.gisSingle = parseFloat(l[3]);
        if (l[4] !== '') {
            out.gisSingleEn = parseFloat(l[4]);
        }
        out.gisMarToPen = parseFloat(l[5]);
        if (l[6] !== '') {
            out.gisMarToPenEn = parseFloat(l[6]);
        }
        out.gisMarToNonPen = parseFloat(l[7]);
        if (l[8] !== '') {
            out.gisMarToNonPenEn = parseFloat(l[8]);
        }
        out.gisMarToAllowRcpt = parseFloat(l[9]);
        if (l[10] !== '') {
            out.gisMarToAllowRcptEn = parseFloat(l[10]);
        }
        out.allow = parseFloat(l[11]);
        if (l[12] !== '') {
            out.allowEn = parseFloat(l[12]);
        }
        if (l[14] !== '') {
            out.allowSurvior = parseFloat(l[13]);
            out.allowSurviorEn = parseFloat(l[14]);
        } else {
            out.allowSurviorEn = parseFloat(l[13]);
        }
        outs[date] = out;
    });
    //Object.keys(outs).sort((a, b) => a > b ? 1 : -1).map((k) => outs[k])
    await promises.writeFile(of, JSON.stringify(outs), 'utf-8');
})();
