export function getAgeAt(date: Date, dob: Date): number {
    let currentYear = date.getFullYear();
    let birthYear = dob.getFullYear();
    let age = currentYear - birthYear;
    if (date < new Date(dob.setFullYear(currentYear))) {
        age = age - 1;
    }
    return age;
}

export function dateToString(date: Date): string {
    const d = date.toLocaleString("en-GB", { day: "2-digit" });;
    const m = date.toLocaleString("en-GB", { month: "2-digit" });
    const y = date.toLocaleString("en-GB", { year: "numeric" });
    return `${y}-${m}-${d}`;
}

export function priorFinancialYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month <= 3) {
        return year - 2;
    } else {
        return year - 1;
    }
}