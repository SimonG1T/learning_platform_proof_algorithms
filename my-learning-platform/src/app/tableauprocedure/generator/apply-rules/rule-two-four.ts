import { removeOuterParenthesis } from "../../../procedure-functions";

/** 
 * This will try to apply the second rule
 * 
 * Rule 2: G & H -> G & H
 */
export function applyRuleTwo(formula: any) {
    let operator = '&'

    let result = applyRuleOnMainOperator(formula, operator);

    return result;
}

/** This will try to apply the fourth rule
 * Rule 4: G | H -> G | H
 */
export function applyRuleFour(formula: any) {
    let operator = '|';

    let result = applyRuleOnMainOperator(formula, operator);

    return result;
}

function applyRuleOnMainOperator(formula: any, operator: string) {

    let result: string[] = [];
    //console.log("Formel2:", formula);
    let first = "";
    let second = "";

    // Find main operator
    let index = firstMainOperator(formula);

    // Check if main operator is in formula
    if (index !== -1 && formula[index] === operator) {

        // Split the formula on its main operator
        [first,second] = split(formula, index);

        first = removeOuterParenthesis(first);
        second = removeOuterParenthesis(second);

        result = [first, second];
    }

    return result;
}

function split(formula: string, index: number) {

    // Split the formula on the index of the operator
    let first = formula.substring(0, index);
    let second = formula.substring(index+1);

    return [first, second];
}

function firstMainOperator(formula: string): number {
    let balance = 0;

    // Get the first operator outside any parenthesis
    for (let i = 0; i < formula.length; i++) {
        let char = formula[i];

        if (char === '!' ||
                isVariable(char)) {
            continue;
        }
        if (char === '(') {
            balance++;
            continue;
        }
        if (char === ')') {
            balance--;
            continue;
        }
        if (char === '&' || char === '|') {
            if (balance === 0) {
                return i;
            }
        }
    }
    return -1;
}

function isVariable(char: string): boolean {
    return /[A-Z]/.test(char);
}
