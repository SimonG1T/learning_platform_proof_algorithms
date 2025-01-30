import { removeOuterParenthesis } from "../../../procedure-functions";


/** This class will try to apply the first rule
 * Rule 1: !!A -> A
 */

export function applyRuleOne(formula: string): string {
    let toRemove = '!!';
    const index = formula.indexOf(toRemove);

    if (index !== -1) {
        // Remove first apperance of !!
        let result =  formula.slice(0, index) + formula.slice(index + toRemove.length);
        return removeOuterParenthesis(result);
    }

    return "";
}
