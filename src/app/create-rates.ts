import { promises } from 'fs';
import * as path from 'path';
import { Rates } from './rates.enum';

// Utility to convert csv to rate constant
// Not used in application

(async () => {
    const file = path.join(__dirname, 'rates.csv');
    const data = await promises.readFile(file, 'utf-8');
    const of = path.join(__dirname, 'rates.json');

    const outs: { [key: string]: Partial<Rates> } = {};
    const d = data.split('\n').forEach((line) => {
        const l = line.split(/ *, */).map(s => String(s).replace(/\$-/g, '0').replace(/\$/g, '').replace(/"/g, '').trim());
        const date = l[0];
        const out: Partial<Rates> = {};
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
