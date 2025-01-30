
// Checks if the formula is a literal
export function isLiteral(char: string): boolean {
    if (char.length === 1 && isVariable(char)) {
        return true;
    } else if (char.length === 2 && char[0] === '!' && isVariable(char[1])) {
        return true;
    } else {
        return false;
    }
}

// Check if the formula is the negation of a literal
export function negateLiteral(char: string): string {
    if (isNegation(char)) {
        return char[1];
    } else if (isVariable(char)) {
        return `!${char}`;
    } else {
        console.log("negation could not be done");
    }
    return '';
}

// Check if the formula is a single variable
export function isVariable(char: string): boolean {
    if (char.length === 1 && /[A-Z]/.test(char)) {
        return true;
    }
    return false;
}

// Check if the formula is a negation of a variable
export function isNegation(chars: string): boolean {
    if (chars.length === 2 && chars[0] === '!' && isVariable(chars[1])) {
        return true;
    }
    return false;
}

// Remove the outer parenthesis for enclosed formula
export function removeOuterParenthesis(formula: string): string {

    // Remove whitespaces
    formula = formula.replace(/\s+/g, '');

    while (true) {
        let tryToRemove = tryRemoveOuterParenthesis(formula);
        if (!tryToRemove[0]) {
            break;
        }
        formula = tryToRemove[1];
    }
    return formula;
}

// Try to remove outer parenthesis from the clause if present
function tryRemoveOuterParenthesis(clause: any): [boolean, string] {
    let stackParenthesis: string[] = [];
    let wasTrimmed = false;
    clause = clause.trim();

    if (clause.startsWith('(') && clause.endsWith(')')) {
        let wasBreak = false; // a break between the parenthesis ()()
        for (let i in clause) {
            if (clause[i] === '(') {
                stackParenthesis.push('(');
            }
            if (clause[i] === ')') {
                stackParenthesis.pop();
                if (stackParenthesis.length === 0) {
                    if (clause.length-1 !== +i) {
                        wasBreak = true;
                    }
                }
            }
        }
        if (!wasBreak) {
            clause = clause.substring(1, clause.length - 1);
            wasTrimmed = true;
        }
    }
    return [wasTrimmed, clause];
}
