import { isLiteral, removeOuterParenthesis } from "../../procedure-functions";
/* 
    This class contains methods to check the input validation for the dpll and the resolution procedure
        Checks if the user input is a formula in KNF
        Checks if the user input is a formula in set notation
 */
export class InputValidation {
    
    // Checks if input was in cnf
    isValidKNF(input: string): boolean {

        // Trim whitespace and remove outer parentheses if present
        input = removeOuterParenthesis(input);

        // Split the input into clauses separated by 'AND'
        const clauses = input.split(/\s*&\s*/);

        // Function to check if a literal is valid
        const isValidLiteral = (literal: string): boolean => {
            return isLiteral(literal);
        };

        // Function to check if a clause is valid
        const isValidClause = (clause: string): boolean => {
            // Remove outer parentheses from the clause if present
            clause = clause.trim();
            if (clause.startsWith('(') && clause.endsWith(')')) {
                clause = clause.substring(1, clause.length - 1);
            }
            // Split the clause into literals separated by 'OR'
            const literals = clause.split(/\s*\|\s*/);
            // Check if all literals in the clause are valid
            return literals.every(isValidLiteral);
        };

        // Check if all clauses in the input are valid
        return clauses.every(isValidClause);
    }

    // Checks if input was in set notation as cnf
    isValidQuantityNotation(input: string): boolean {
        // remove white-space
        const sanitizedInput = input.replace(/\s+/g, '');

        // RegEx explanation:
        // ^\{                      -> Starts with open parenthesis
        // (                        -> Start of a group (for multiple sets)
        //   \{                     -> Opening parenthesis for single set
        //   (!?[a-zA-Z](,!?[a-zA-Z])*) -> A single literal evantually with a leading '!', separated by commas
        //   \}                     -> Closed parenthisis for single set
        //   (;\{                   -> Semikolon as separator between sets
        //   !?[a-zA-Z](,!?[a-zA-Z])* -> Further sets Mengen following the same pattern
        //   \}                     -> Closed parenthesis for sets
        // )*                       -> Multiple sets are optional (0 oder mehr)
        // \}$                      -> Ends with a closed parenthesis for the whole set
        
        const regex = /^\{(\{!?[a-zA-Z](,!?[a-zA-Z])*\}(;\{!?[a-zA-Z](,!?[a-zA-Z])*\})*)?\}$/;

        // Check the input for the quantity notation format
        return regex.test(sanitizedInput);
    }

    // Checks if input was in set notation as single disjunction
    isValidSingleQuantityNotation(input: string): boolean {
        // remove white-space
        const sanitizedInput = input.replace(/\s+/g, '');

        // RegEx explanation:
        // ^\{                          -> Starts with Opening parenthesis for single set
        //   (!?[a-zA-Z](,!?[a-zA-Z])*) -> A single literal evantually with a leading '!', separated by commas
        // \}$                          -> Ends with Closed parenthisis for single set
        
        const regex = /^\{(!?[a-zA-Z](,!?[a-zA-Z])*)*\}$/;

        // Check the input for the quantity notation format
        return regex.test(sanitizedInput);
    }
}
