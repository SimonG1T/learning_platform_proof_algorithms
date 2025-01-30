
/**
 * This class will translate the KNF into set notation
 * 
 * It will create a quantity of lists
 */
export class SetTranslator {

    private a = ["A","B"];

    translateToSet(input: string) {

        // Remove all paranthesis, since the formula is in knf
        let formula = input.replaceAll('(', '');
        formula = formula.replaceAll(')', '');
        // console.log("trimmed", formula);

        // Quantity of clauses
        const mySet:Set<string[]> = new Set();
        
        // Split the input into clauses separated by 'AND'
        const clauses = formula.split(/\s*&\s*/);

        // Split the clauses into literals separated by 'OR'
        for (let clause of clauses) {
            let literals = clause.split(/\s*\|\s*/);
            mySet.add(literals);
        }

        for (const l of mySet) {
            console.log("Quantity:", l);
        }
        return mySet;
    }

    translateSingle(input: string): string[] {

        // Remove all paranthesis, since the formula is in set notation
        let formula = input.replaceAll('{', '');
        formula = formula.replaceAll('}', '');

        // Split the clause into literals separated by 'OR' ','
        let disjunction = formula.split(/\s*,\s*/);
        console.log("disjunction:", disjunction);

        return disjunction;
    }

    translateToArraySet(input: string) {

        // Remove all paranthesis, since the formula is in set notation
        let formula = input.replaceAll('{', '');
        formula = formula.replaceAll('}', '');
        // console.log("trimmed", formula);

        // Quantity of clauses
        const mySet:Set<string[]> = new Set();
        console.log("MySet", mySet, mySet.size);
        
        // Split the input into clauses separated by 'AND' ';'
        const clauses = formula.split(/\s*;\s*/);

        // Split the clauses into literals separated by 'OR' ','
        for (let clause of clauses) {
            let literals = clause.split(/\s*,\s*/);
            // console.log("a", this.a, literals);
            mySet.add(literals);
            // console.log("Menge von Liste", literals, mySet, mySet.size);
        }

        console.log("Quantity of Lists", mySet, mySet.size);
        for (const l of mySet) {
            console.log("Q", l);
        }
        return mySet;
    }
}
