
/**
 * Checks if the user input is a formula in logic style
 */
export class TableauInputValidation {

    isValidTableauInput(input: string,): boolean {

        //const negationRegex = /^*!w/ // /^!\s*(\w+)$/;
        const binaryOperatorRegex = /\s*(\&\&|\|\||->|<->)\s*/; // &&, ||, ->, <->
    
        // Remove whitespace from the input
        input = input.replace(/\s+/g, '');
    
        // Stack to handle parentheses
        const stack: string[] = [];
        // Predecessor to handle invalid successors
        let oldChar: string = "";

        // first appearances for && and ||
        let firstAppearance: boolean = true;
    
        let i = 0;
        while (i < input.length) {
            const char = input[i];
            // console.log(i, ':', oldChar, char, stack);
    
            if (char === '(') {
                if (!this.validPredecessor(oldChar, "!&|<-(", false)) {
                    console.log("invalid successor");
                    return false; // Invalid successor
                }
                stack.push(char);
            } else if (char === ')') {
                if (stack.length === 0) {
                    console.log("unmatched closing parenthesis")
                    return false; // Unmatched closing parenthesis
                } else if (!this.validPredecessor(oldChar, "a()", true)) {
                    console.log("invalid successor");
                    return false; // Invalid successor
                }
                stack.pop();
            } else if (this.isLetter(char)) {
                if (!this.validPredecessor(oldChar, "!&|<-(", false)) {
                    console.log("invalid successor");
                    return false; // Invalid successor
                }
            } else if (char === '!') {
                if (!this.validPredecessor(oldChar, "!&|<-(", false)) {
                    console.log("invalid successor");
                    return false; // Invalid successor
                }
            } else if (char === '&') {
                if (firstAppearance && input.substring(i+1) === '&') {
                    console.log("rule successor");
                    i++;
                    firstAppearance = false;
                }
            } else if (char === '|') {
                if (firstAppearance && input.substring(i+1) === '|') {
                    console.log("rule successor");
                    i++;
                    firstAppearance = false;
                }
            } else if (binaryOperatorRegex.test(input.substring(i))) {
                console.log("binary operator");
                // Move index past the binary operator
                i += input.substring(i).match(binaryOperatorRegex)![0].length - 1;
            }
            i++;
            oldChar = char;
        }
    
        // If stack is not empty, there are unmatched opening parentheses
        return stack.length === 0;
    }

    isLetter(char: string): boolean {
        return /[A-Z]/.test(char);
    }
    validPredecessor(predecessor: string, valids: string, validLetter: boolean): boolean {
        // Allow the beginning of arrow operators: -> and <->

        // checks if the predecessor is a valid char
        if (predecessor.length > 0) {
            if (valids.includes(predecessor)) {
                return true;
            } else if (validLetter) {
                // checks if predecessor contains letter
                if (this.isLetter(predecessor)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
}
