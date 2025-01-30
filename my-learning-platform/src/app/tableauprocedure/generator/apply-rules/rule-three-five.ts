import { isVariable, removeOuterParenthesis } from "../../../procedure-functions";

/** 
 * This will try to apply the third and fith rule
 * It will eliminate the !() and change the inner operators and variables to its negation
 * 
 * Rule 3: !(G & H) => G | H
 * Rule 5: !(G | H) => G & H
 */
export function applyRuleThreeFive(formula: any) {

    let stackParenthesis: string[] = [];   // keeping track of opened parenthesis
    let relevantSection: boolean = true;   // relevant section of the formula enclosed within !() but not inner formulas
    let rule: number = 0;                  // rule 3 or five
    
    let result: string[] = [];

    if (formula[0] === '!' && formula[1] === '(') {

        //console.log("Formel35:", formula);

        // remove first two characters !
        formula = formula.substring(1, formula.length);

        for (let i in formula) {
            let char = formula[i];
    
            // Negation
            if (char === '!') {
                result.push(char);
                continue;
            }

            // Variable
            else if (isVariable(char)) {
                if (stackParenthesis.length === 1 && relevantSection) {
                    result.push('!');
                }
                result.push(char);
                continue;
            }

            // Parenthesis close
            else if (char === ')') {
                stackParenthesis.pop();
                if (stackParenthesis.length === 0 && relevantSection) {
                    relevantSection = false;
                }
                result.push(char);
                continue;
            }

            // Parenthesis open
            else if (char === '(') {
                stackParenthesis.push(char);
                if (stackParenthesis.length === 2 && relevantSection) {
                    result.push('!');
                }
                result.push(char);
                continue;
            }

            // Operators
            else if (char === '&') {
                if (stackParenthesis.length === 1 && relevantSection) {
                    if (rule === 0) {
                        rule = 3;
                        console.log(3, ":");
                    }
                    result.push('|');
                } else {
                    result.push(char);
                }
                continue;

            } else if (char === '|') {
                if (stackParenthesis.length === 1 && relevantSection) {
                    if (rule === 0) {
                        rule = 5;
                        console.log(5, ":");
                    }
                    result.push('&');
                } else {
                    result.push(char);
                }
                continue;
            }

            else {
                result.push(char);
            }
        }
        if (rule === 3 || rule === 5) {
            let formula = removeOuterParenthesis(result.join(''));
            let arr = [rule, formula];
            console.log("Ende35", rule, arr);
            return arr;
        } else {
            let formula = removeOuterParenthesis(result.join(''));
            let arr = ['35', formula];
            console.log("not-35:", arr);
            return arr;
        }
    }
    return "";
}
