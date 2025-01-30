import { Renderer2 } from "@angular/core";
import { TreeCreator } from "./tree-creator";
import { CustomMap, ValueType } from "./custom-map";
import { isLiteral, negateLiteral } from "../../../procedure-functions";
import { showExplanation } from "../example/explanation";


/**
 * Rekursiver Erfüllbarkeitstest des DPLL-Verfahren
 * Example - step by step creation
 */
export class DpllProcedureEvaluation {

    // Tree Creator
    private instanceOfTreeCreator: TreeCreator = new TreeCreator(this.renderer);

    // Id for the current node
    private id: number = -1;
    // Id for parent id
    private fromId: number = -1;
    // Literal to apply on set
    private literal: string = "";
    // Set that contains the current formula
    private mySet: Set<string[]> = new Set;
    // list for negated literals that were not used yet
    // id, fromId, literal
    private unused: any[] = [];

    // update map and tree, check for empty, get literal, single
    private order: number = 1;

    constructor(private customMap: CustomMap, private renderer: Renderer2) {}

    reset() {
        this.unused = [];
        this.resetOnNext();
    }

    // Reset the current procedure values
    resetOnNext() {
        // this.customMap.clear();
        this.id = -1;
        this.fromId = -1;
        this.literal = "";
        this.mySet = new Set;
        this.order = 1;
    }

    applyProcedure(wasBoolean: boolean) {
        console.log("was-boolean:", wasBoolean);

        let parentEntry:string[][]|undefined = undefined;
        let childEntry:string[][]|undefined = undefined;
        let parent:string[][] = [];
        let child: string[][] = [];
        let literal = "";

        // update the map and tree whenever a new set is handled
        if (this.customMap.getSize() === 0 || wasBoolean) {
            if (wasBoolean) {
                // apply literal on unused sibling
                this.single();
            }

            this.handleUpdate();

            if (wasBoolean) {
                // Get the negated literal, its parent and its created child
                parentEntry = this.customMap.getSpecificFormula(this.fromId);
                if (parentEntry !== undefined) {
                    parent = parentEntry;
                }
                childEntry = this.customMap.getSpecificFormula(this.id);
                if (childEntry !== undefined) {
                    child = childEntry;
                }
                literal = this.literal;
            }

            // Highlight current element
            this.instanceOfTreeCreator.highlightClickElement(this.id);

            showExplanation('create', undefined, this.customMap.getSize(), parent, literal, child);
            return;
        }

        // choose the function for the current state
        switch (this.order) {

            case 1:
                this.order++;
                console.log("check finish");
                let check = this.checkFinish();
                console.log("check:", check);

                // Highlight current element
                this.instanceOfTreeCreator.highlightClickElement(this.id);

                showExplanation('check', check, this.unused.length);
                return check;

            case 2:
                this.order++;
                console.log("get-literal");
                let literal = this.checkLiteral();

                parentEntry = this.customMap.getSpecificFormula(this.fromId);
                if (parentEntry !== undefined) {
                    parent = parentEntry;
                }

                // Highlight current element
                this.instanceOfTreeCreator.highlightClickElement(this.fromId);

                showExplanation('literal', undefined, null, parent, literal);
                return literal;

            case 3:
                this.order++;
                console.log("handle single");
                let single = this.single();
                this.handleUpdate();
                console.log("single:", single);

                parentEntry = this.customMap.getSpecificFormula(this.fromId);
                if (parentEntry !== undefined) {
                    parent = parentEntry;
                }
                childEntry = this.customMap.getSpecificFormula(this.id);
                if (childEntry !== undefined) {
                    child = childEntry;
                }

                // Highlight current element
                this.instanceOfTreeCreator.highlightClickElement(this.fromId);

                showExplanation('single', undefined, null, parent, this.literal, child);
                return single;

            default:
                this.order = 1;
                // showExplanation('rerun', undefined);
                let result: any = this.applyProcedure(false);
                if (result !== undefined) {
                    return result;
                }
        }
        return;
    }

    setAttributes(id: number, fromId: number, literal: string, mySet: Set<string[]>) {
        this.id = id;
        this.fromId = fromId;
        this.literal = literal;
        this.mySet = mySet;
    }

    checkFinish() {
        // Empty set: S = {} => true
        if (this.mySet.size === 0) {
            console.log("Ist Leere Menge");
            return true;
        }

        // Contains empty clause: S = {{}} => false
        let hasEmptyC = hasEmpty(this.mySet);
        if (hasEmptyC) {
            console.log("Enthält leere Menge");
            this.instanceOfTreeCreator.addContradictionNode(this.id, this.fromId);
            return false;
        }
        return;
    }

    handleUpdate() {

        // Update map
        this.updateMap();
        console.log("map:", this.customMap);

        // Update tree
        this.instanceOfTreeCreator.addNode(this.id, this.literal, this.mySet, this.fromId);
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

    checkLiteral() {
        // Check if the set contains a single literal
        let literal = this.getLiteral(this.mySet);
        let negatedLiteral = "";

        // Single literal:
        if (literal.length !== 0) {
            console.log("single:", literal);

            // copy set
            let newSet = new Set(...[this.mySet]);
            this.setAttributes(this.id+1, this.id, literal, newSet);
            return literal;
        }

        // Choose a literal
        [literal, negatedLiteral] = this.getLiterals(this.mySet);

        // Multi literals:
        if (literal.length !== 0 && negatedLiteral.length !== 0) {
            console.log("multy:", literal, negatedLiteral);

            // copy set
            let newSet = new Set(...[this.mySet]);

            // handle negated literal
            // id, fromId, negatedLiteral
            let nextNId = calculateNextNegatedId(this.id);
            let resultN = [nextNId, this.id, negatedLiteral];
            this.unused.push(resultN);
            console.log("unused:", [...this.unused]);
            
            // copy set
            newSet = new Set(...[this.mySet]);

            // handle literal
            let nextId = calculateNextId(this.id);
            this.setAttributes(nextId, this.id, literal, newSet);

            return [literal, negatedLiteral];
        }
        return;
    }

    // Apply on single literal
    single(): Set<string[]> {
        let newSet = new Set(...[this.mySet]);
        console.log("apply-single:", newSet);

        for (let clause of newSet) {

            // Cut clause containing the literal
            if (clause.includes(this.literal)) {

                // remove clause from the set
                newSet.delete(clause);
            }
        }

        // Cut negated literal from remaining clauses
        let single = this.reduceSingleLiteral(this.literal, newSet);

        this.mySet = single;
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

    getUnused() {
        return this.unused;
    }

    popUnused() {
        let next = this.unused.pop();
        return next;
    }

    updateMap() {
        
        // Convert Set to Array
        let myArray: string[][] = [...this.mySet];

        // Add entries to map
        let value: ValueType = { fromId:this.fromId, literal:this.literal, formula:myArray };
        this.customMap.setMapEntry(this.id, value);
    }
}

// Calculate the next id for the literal
export function calculateNextId(id: number): number {
    let nextId = id;

    // integer
    if (id % 1 === 0) {
        nextId += 1.1;

    } else {
        // add 1 to the int-part and append 1 to the float-part
        let idStr = id.toString();
        let idArr = idStr.split('.');

        let idInt = +idArr[0] +1;
        let idFloat = idArr[1] + '1';

        idStr = `${idInt.toString()}.${idFloat}`;
        nextId = +idStr;
    }
    console.log("next-id-literal:", nextId);
    return nextId;
}
// Calculate the next id for the negated literal
export function calculateNextNegatedId(id: number): number {
    let nextId = id;

    // integer
    if (id % 1 === 0) {
        nextId += 1.2;

    } else {
        // add 1 to the int-part and append 2 to the float-part
        let idStr = id.toString();
        let idArr = idStr.split('.');

        let idInt = +idArr[0] +1;
        let idFloat = idArr[1] + '2';

        idStr = `${idInt.toString()}.${idFloat}`;
        nextId = +idStr;
    }
    console.log("next-id-negated:", nextId);
    return nextId;
}

export function hasEmpty(mySet: Set<string[]>): boolean {
    // Check if the set contains an empty clause
    for (const clause of mySet) {
        if (clause.length === 0) {
            // clause was empty
            return true;
        }
    }
    return false;
}
