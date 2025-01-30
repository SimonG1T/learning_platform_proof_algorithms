import { applyRuleOne } from "../../tableauprocedure/generator/apply-rules/rule-one";
import { applyRuleThreeFive } from "../../tableauprocedure/generator/apply-rules/rule-three-five";
import { applyRuleSix, applyRuleSeven } from "../../tableauprocedure/generator/apply-rules/rule-six-seven";
import { removeOuterParenthesis } from "../../procedure-functions";

/**
 * This class will translate the input into a cnf-notation
 * 
 * It will create a string
 */
export class CNFTranslator {

    translateToCNF(input: string) {
        console.log("cnf-input:", input);
        let formula = input;
        
        // Example for useage
        // const formula = "(A -> B) & (!C | (D <-> E))";
        //  equivalence  = "(A -> B) & (!C | (!D|E)) & (!E|D))"
        //  implication  = "(!A | B) & (!C | (!D|E)) & (!E|D))"
        //  distribution = "(!A | B) & (!C|!D|E) & (!C|!E|D)"

        console.log("cnf-input:", formula);
        let result = toCNF(formula);
        console.log("converted-CNF-from-string:", result);  // Expected output is cnf-version of the formula

        return result;
    }
}

// Define Types for the AST
type Literal = string; // A Literal is a variable, e.g. "A" oder "B"

type Expr = 
    | { type: "Literal", value: Literal }
    | { type: "Not", operand: Expr }
    | { type: "And", left: Expr, right: Expr }
    | { type: "Or", left: Expr, right: Expr }
    | { type: "Implies", left: Expr, right: Expr }
    | { type: "Equiv", left: Expr, right: Expr };

// Help-Function: Handle operators
function handleOperators(formula: string) {
    // Remove whitespaces
    formula = formula.replace(/\s+/g, '');

    // Remove outer parenthesis
    if (formula.startsWith('(') && formula.endsWith(')')) {
        formula = removeOuterParenthesis(formula);
    }

    // Step 1: Remove Implication and Equivalenz
    // Handle equivalence: <->
    while (formula.includes('<->')) {
        formula = applyRuleSeven(formula);
    }
    // Handle implication: ->
    while (formula.includes('->')) {
        formula = applyRuleSix(formula);
    }
    
    // Step 2: Pull the Negation inside
    // Handle double negation: !!
    while (formula.includes('!!')) {
        formula = applyRuleOne(formula);
    }
    // Handle negation: !()
    while (formula.includes('!(')) {
        formula = applyRuleThreeFive(formula)[1].toString();
    }

    return formula;
}

// Help-Function: Remove parenthesis and disassemble the formula
function parseFormula(formula: string): Expr {
    // Remove whitespaces
    formula = formula.replace(/\s+/g, '');

    // If formula is enclosed in parenthesis, remove them
    if (formula.startsWith('(') && formula.endsWith(')')) {
        formula = removeOuterParenthesis(formula);
    }
    console.log("removed-outer-parenthesis", formula);

    // Recursiv function, to consider the order of the operators
    function parseSubformula(subformula: string): Expr {
        subformula = removeOuterParenthesis(subformula);

        // Search for the main operator outside the parenthesis
        let [mainOperatorIndex, mainOperator] = searchMainOperator(subformula);

        if (mainOperator !== null && mainOperatorIndex !== -1) {

            const left = subformula.slice(0, mainOperatorIndex);
            const right = subformula.slice(mainOperatorIndex + mainOperator.length);

            switch (mainOperator) {
                case "<->":
                    return { type: "Equiv", left: parseSubformula(left), right: parseSubformula(right) };
                case "->":
                    return { type: "Implies", left: parseSubformula(left), right: parseSubformula(right) };
                case "|":
                    return { type: "Or", left: parseSubformula(left), right: parseSubformula(right) };
                case "&":
                    return { type: "And", left: parseSubformula(left), right: parseSubformula(right) };
            }
        }

        // If formula starts with "!", handle Negation
        if (subformula.startsWith("!")) {
            return { type: "Not", operand: parseSubformula(subformula.slice(1)) };
        }

        // If no parenthesis or operators are present, it is a literal
        if (/^[A-Za-z]+$/.test(subformula)) {
            return { type: "Literal", value: subformula };
        }

        // Fallback, if formula was unexpected
        throw new Error("Ungültige Formel: " + subformula);
    }

    return parseSubformula(formula);
}

// Step 3: Apply distributive law
function distributeOrOverAnd(expr: Expr): Expr {
    if (expr.type === "Or") {
        const left = distributeOrOverAnd(expr.left);
        const right = distributeOrOverAnd(expr.right);

        if (left.type === "And") {
            return {
                type: "And",
                left: distributeOrOverAnd({ type: "Or", left: left.left, right }),
                right: distributeOrOverAnd({ type: "Or", left: left.right, right })
            };
        } else if (right.type === "And") {
            return {
                type: "And",
                left: distributeOrOverAnd({ type: "Or", left, right: right.left }),
                right: distributeOrOverAnd({ type: "Or", left, right: right.right })
            };
        }
        return { type: "Or", left, right };
    } else if (expr.type === "And") {
        return { type: "And", left: distributeOrOverAnd(expr.left), right: distributeOrOverAnd(expr.right) };
    }
    return expr;
}

// Main-Function: Transform a formula to cnf
function toCNF(formula: string): boolean | string {

    // Handle the operators
    formula = handleOperators(formula);

    const parsedExpr = parseFormula(formula);
    const cnfExpr = distributeOrOverAnd(parsedExpr);

    let stringyfiedCNF = exprToString(cnfExpr);
    console.log("stringified-cnf:", stringyfiedCNF);

    // Parenthesis should separate only the disjunctions
    let handledCNF = handleParenthesis(stringyfiedCNF);
    console.log("handled-parenthesis:", handledCNF);

    // Uneven number of parenthesis in disjunction => no cnf
    if (typeof handledCNF == "boolean") {
        return false;
    }

    // Remove Whitespaces
    stringyfiedCNF = handledCNF.replace(/\s+/g, '');
    return stringyfiedCNF;
}

// Help-Function: Search for the main operator outside the parenthesis
function searchMainOperator(subformula: string): [number,string|null] {
    let balance = 0;
    let mainOperatorIndex = -1;
    let mainOperator: string | null = null;

    for (let i = 0; i < subformula.length; i++) {
        const char = subformula[i];
        if (char === '(') balance++;
        if (char === ')') balance--;

        if (balance === 0) {
            if (char === '|') {
                mainOperator = "|";
                mainOperatorIndex = i;
            } else if (char === '&') {
                mainOperator = "&";
                mainOperatorIndex = i;
            }
        }
    }
    return [mainOperatorIndex,mainOperator];
}

// Help-Function: Eliminates the parenthesis in the disjunctions
function handleParenthesis(formula: string): boolean | string {
    let balance = 0;

    // Remove outer parenthesis
    formula = removeOuterParenthesis(formula);

    // Number of parenthesis are ok
    for (let i = 0; i < formula.length; i++) {
        const char = formula[i];
        if (char === '(') balance++;
        if (char === ')') balance--;
    }

    if (balance !== 0) {
        // Fallback, if sub-formula has an uneven number of parenthesis
        return false;
    }

    if (formula.includes('&')) {
        // Split if conjunction
        let [mainOperatorIndex,mainOperator] = searchMainOperator(formula);

        if (mainOperator === '&') {

            let first = formula.substring(0,mainOperatorIndex);
            let second = formula.substring(mainOperatorIndex+1,formula.length);

            let firstC = handleParenthesis(first);
            let secondC = handleParenthesis(second);

            if (typeof firstC === 'boolean' || typeof secondC === 'boolean') {
                return false;
            } else if (typeof firstC === 'string' || typeof secondC === 'string') {
                return [firstC.toString(), secondC.toString()].join('&');
            }
        } else {
            // Not CNF: Conjunction within disjunction
            return false;
        }
    } else {
        // Remove all '()' if disjunction
        formula = formula.replaceAll('(', '');
        formula = formula.replaceAll(')', '');

        return formula;
    }
    return '';
}

// Help-Function: Convert AST back to a string
function exprToString(expr: Expr): string {
    switch (expr.type) {
        case "Literal": return expr.value;
        case "Not": return `!${exprToString(expr.operand)}`;
        case "And": return `(${exprToString(expr.left)} & ${exprToString(expr.right)})`;
        case "Or": return `(${exprToString(expr.left)} | ${exprToString(expr.right)})`;
    }
    return '';
}

// Example for the Visualisation in Expression
const exampleFormula: Expr = {
    type: "And",
    left: { type: "Implies", left: { type: "Literal", value: "A" }, right: { type: "Literal", value: "B" } },
    right: {
        type: "Or",
        left: { type: "Not", operand: { type: "Literal", value: "C" } },
        right: { type: "Equiv", left: { type: "Literal", value: "D" }, right: { type: "Literal", value: "E" } }
    }
};
