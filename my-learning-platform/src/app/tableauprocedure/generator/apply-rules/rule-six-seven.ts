
import { removeOuterParenthesis } from "../../../procedure-functions";


/** This class will try to apply the sixth and seventh rule
 * Implications
 * Rule 6:   G  -> H  => !G |  H
 * Rule 8: !(G  -> H) =>  G & !H
 * 
 * Equivalents
 * Rule 7:   G <-> H  => (!G |  H) & (!H |  G)
 * Rule 9: !(G <-> H) => ( G & !H) | ( H & !G)
 */

// Equivalents '<->'
export function applyRuleSeven(formula: string): string {
    const index = formula.indexOf('<->');

    if (index !== -1) {
        let first = "";
        let second = "";
        // index for predecessor
        let iPre = 0;
        // index for successor
        let iSucc = formula.length;
        let stackParenthesis = 0;

        // Handle parenthesis
        for (let i = index-1; i >= 0; i--) {
            // Left side of the operator can be enclosed in parenthesis
            if (formula[i] === '(') {
                if (stackParenthesis === 0) {
                    iPre = i+1;
                    break;
                }
                stackParenthesis--;
            } else if (formula[i] === ')') {
                stackParenthesis++;
            }
        }
        first = formula.substring(iPre, index);

        stackParenthesis = 0;
        for (let j = index+3; j < formula.length; j++) {
            // Right side of the operator can be enclosed in parenthesis and can end with next equivalent
            if (formula[j] === '<' && stackParenthesis === 0) {
                iSucc = j;
                break;
            }
            if (formula[j] === ')') {
                if (stackParenthesis === 0) {
                    iSucc = j;
                    break;
                }
                stackParenthesis--;
            } else if (formula[j] === '(') {
                stackParenthesis++;
            }
        }
        second = formula.substring(index+3, iSucc);

        // (!A|B) & (!B|A) = (!first | second) & (!second | first)
        let equivalents = `(!${first}|${second})&(!${second}|${first})`;
        let result = formula.substring(0,iPre) + equivalents + formula.substring(iSucc,formula.length);
        return removeOuterParenthesis(result);
    }
    return '';
}


// Implications '->'
export function applyRuleSix(formula: string): string {
    const index = formula.indexOf('->');

    if (index !== -1) {
        let first = "";
        let second = "";
        // index for predecessor
        let iPre = 0;
        // index for successor
        let iSucc = formula.length;
        let stackParenthesis = 0;

        for (let i = index-1; i >= 0; i--) {
            // left side of operator can be enclosed in parenthesis
            if (formula[i] === '(') {
                if (stackParenthesis === 0) {
                    iPre = i+1;
                    break;
                }
                stackParenthesis--;
            } else if (formula[i] === ')') {
                stackParenthesis++;
            }
        }
        first = formula.substring(iPre, index);

        stackParenthesis = 0;
        for (let j = index+2; j < formula.length; j++) {
            // Right side of operator can be enclosed in parenthesis and can end with next implicator
            if (formula[j] === '-' && stackParenthesis === 0) {
                iSucc = j;
                break;
            }
            if (formula[j] === ')') {
                if (stackParenthesis === 0) {
                    iSucc = j;
                    break;
                }
                stackParenthesis--;
            } else if (formula[j] === '(') {
                stackParenthesis++;
            }
        }
        second = formula.substring(index+2, iSucc);

        // !A | B = !first | second
        let implications = `!${first}|${second}`;
        let result = formula.substring(0,iPre) + implications + formula.substring(iSucc,formula.length);
        return removeOuterParenthesis(result);
    }
    return '';
}
