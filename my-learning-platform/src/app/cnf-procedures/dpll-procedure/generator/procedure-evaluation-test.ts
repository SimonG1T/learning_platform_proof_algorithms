import { Renderer2 } from "@angular/core";
import { TreeCreator } from "./tree-creator";
import { CustomMap, ValueType } from "./custom-map";
import { isLiteral, negateLiteral } from "../../../procedure-functions";
import { calculateNextId, calculateNextNegatedId } from "./procedure-evaluation-example";


/**
 * Rekursiver Erfüllbarkeitstest des DPLL-Verfahren
 * Test / Calculator - create the tree
 */
export class DpllProcedureEvaluation {

    // Tree Creator
    private instanceOfTreeCreator: TreeCreator = new TreeCreator(this.renderer);

    // Id for the current node
    private id: number = -1;
    // Id for parent id
    private parentId: number = -1;

    constructor(private customMap: CustomMap, private renderer: Renderer2) {}

    // Reset the current procedure values
    reset() {
        this.customMap.clear();
        this.id = -1;
        this.parentId = -1;
    }

    // Apply procedure
    reduce(mySet: Set<string[]>, literal: string='', id: number=0, fromId: number=-1): boolean {
        let negatedLiteral = '';
        this.parentId = fromId;
        this.id = id;

        console.log("reduce:", mySet, literal, id);

        // Update map
        this.updateMap(literal, mySet);
        console.log("map:", this.customMap);

        // Update tree
        this.instanceOfTreeCreator.addNode(id, literal, mySet, fromId);

        // Empty set: S = {} => true
        if (mySet.size === 0) {
            console.log("Ist Leere Menge");
            return true;
        }

        // Contains empty clause: S = {{}} => false
        let hasEmpty = this.hasEmpty(mySet);
        if (hasEmpty) {
            console.log("Enthält leere Menge");
            this.instanceOfTreeCreator.addContradictionNode(id,fromId);
            return false;
        }

        // Check if the set contains a single literal
        literal = this.getLiteral(mySet);

        // Single literal:
        if (literal.length !== 0) {
            console.log("single:", literal);

            // copy set
            let newSet = new Set(...[mySet]);

            // handle single
            let literalSet = this.single(literal, newSet);

            return this.reduce(literalSet, literal, id+1, id);
        }

        // Choose a literal
        [literal, negatedLiteral] = this.getLiterals(mySet);

        // Multi literals:
        if (literal.length !== 0 && negatedLiteral.length !== 0) {
            console.log("multy:", literal, negatedLiteral);

            // copy set
            let newSet = new Set(...[mySet]);

            // handle literal
            let literalSet = this.single(literal, newSet);
            let nextId = calculateNextId(id);
            let resultL = this.reduce(literalSet, literal, nextId, id);

            // copy set
            newSet = new Set(...[newSet]);

            // handle negated literal
            let negatedSet = this.single(negatedLiteral, newSet);
            let nextNId = calculateNextNegatedId(id);
            let resultN = this.reduce(negatedSet, negatedLiteral, nextNId, id);

            let result = resultL || resultN;
            return result;
        }

        console.log("No literal could be found!");
        return false;
    }

    hasEmpty(mySet: Set<string[]>): boolean {
        // Check if the set contains an empty clause
        for (const clause of mySet) {
            if (clause.length === 0) {
                // clause was empty
                return true;
            }
        }
        return false;
    }

    deepCopySetOfArrays(originalSet: Set<string[]>): Set<string[]> {
        const newSet = new Set<string[]>();
    
        for (let array of originalSet) {
            // Copy each array within the sets
            const newArray = [...array]; // Create a copy of the array
            newSet.add(newArray); // Add the copied array to the set
        }
    
        return newSet;
    }

    // Apply on single literal
    single(literal: string, mySet: Set<string[]>): Set<string[]> {
        let newSet = new Set(...[mySet]);

        for (let clause of newSet) {

            // Cut clause containing the literal
            if (clause.includes(literal)) {

                // remove C from S
                newSet.delete(clause);
            }
        }

        let single = this.reduceSingleLiteral(literal, newSet);
        return single;
    }

    reduceSingleLiteral(literal: string, mySet: Set<string[]>): Set<string[]> {

        let negatedLiteral = negateLiteral(literal);
        let newSet: Set<string[]> = this.deepCopySetOfArrays(mySet);

        // Apply the literal on all clauses
        for (let clause of newSet) {

            // Remove all negations of the literal in clause
            while (clause.includes(negatedLiteral)) {
                let index = clause.indexOf(negatedLiteral);
                clause.splice(index, 1);
            }
        }

        return newSet;
    }

    removeDuplicates(set: Set<string[]>) {
        // filter duplicates
        if (set.size > 1) {
            let array = Array.from(
                new Set(Array.from(set).map(arr => JSON.stringify(arr)))
            ).map(str => JSON.parse(str));
            set = new Set(array);
        }
        return set;
    }

    getLiteral(mySet: Set<string[]>): string {

        // Find single literal in clauses
        for (const clause of mySet) {

            // Single clause
            if (clause.length === 1) {
                let literal = clause[0];

                // Check for literal
                if (isLiteral(literal)) {
                    return literal;
                }
            }
        }
        return "";
    }

    getLiterals(mySet: Set<string[]>): string[] {
        let literal: string | undefined = "";
        let negatedLiteral = "";

        // Choose the first literal
        literal = this.getFirstStringFromFirstArray(mySet);

        if (literal === undefined) {
            // No literal could be found
            return ["",""];
        }

        // Negate the literal
        negatedLiteral = negateLiteral(literal);

        return [literal, negatedLiteral];
    }

    getFirstStringFromFirstArray(set: Set<string[]>): string | undefined {
        // Iterator over set
        const iterator = set.values();

        // First array of set
        const firstArray = iterator.next();

        if (!firstArray.done && firstArray.value.length > 0) {

            // First string of array
            const firstString = firstArray.value[0];

            if (firstString.length !== 0) {
                return firstString;
            }
        }

        // Set is empty or first array is empty
        return undefined;
    }

    updateMap(literal:string, mySet:Set<string[]>) {
        
        // Convert Set to Array
        let myArray: string[][] = [...mySet];

        // Add entries to map
        let value: ValueType = { fromId:this.parentId, literal:literal, formula:myArray };
        this.customMap.setMapEntry(this.id, value);
    }
}
