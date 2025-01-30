import { Renderer2 } from "@angular/core";
import { TreeCreator } from "./tree-creator";
import { CustomMap, ValueType } from "./custom-map";
import { FeedbackService } from "../../../feedback/feedback.service";
import { negateLiteral } from "../../../procedure-functions";
import { calculateNextId, calculateNextNegatedId } from "./procedure-evaluation-example";


/**
 * Rekursive fulfillability test
 * Exercise
 * Step-by-step checking
 */
export class DpllProcedureEvaluationExercise {

    // Tree Creator
    private instanceOfTreeCreator: TreeCreator = new TreeCreator(this.renderer);

    // Input: expected child
    private expectedChild: Set<string[]> = new Set;
    // Id for the current node
    private id: number = -1;
    // Id for parent id
    private fromId: number = -1;
    // Literal to apply on set
    private literal: string = "";
    // Set that contains the current formula
    private mySet: Set<string[]> = new Set;
    // List for negated literals that were not used yet
    // id, fromId, literal
    private unused: any[] = [];
    // List of ids that are not finished yet
    private unfinishedIds: number[] = [];

    constructor(private customMap: CustomMap, private renderer: Renderer2, private feedbackService: FeedbackService) {}

    reset() {
        this.resetNext();
        this.fromId = -1;
        this.mySet = new Set;
        this.unused = [];
        this.unfinishedIds = [];
    }

    resetNext() {
        this.expectedChild = new Set;
        this.id = -1;
        this.literal = "";
    }


    // Apply procedure
    reduce(inputSet: Set<string[]>): boolean | undefined {
        console.log("input:", this.formatSet(inputSet));

        // Reset the round variables
        this.resetNext();

        // Add root
        if (this.customMap.getSize() === 0) {
            console.log("root");
            this.fromId = -1;
            this.id = 0;
            this.mySet = inputSet;

            this.handleUpdate();

            this.feedbackService.doubleMessage(`Die Wurzel wurde erstellt.`);

            // Check finish
            let check = this.checkFinish();

            if (check === undefined) {
                this.updateUnused(true);
            }

            return check;
        }

        // Check choosen from-id
        let idValid = this.checkFromId();
        if (!idValid) {
            this.feedbackService.doubleMessage(`Das ausgewählte Parent-Element ist nicht anwendbar.<br>Wähle ein Neues.`);
            return;
        }

        // Get set for the choosen from-id
        let entry = this.customMap.getSpecificFormula(this.fromId);
        if (entry !== undefined) {
            this.mySet = new Set(entry);
            console.log("my-set:", this.formatSet(this.mySet));

        } else {
            console.log("No set was found!");
            return;
        }

        // Store the input as expected child
        this.expectedChild = inputSet;

        if (this.id !== -1) {

            this.feedbackService.doubleMessage(`<br>Es wurde ein unverwendetes negiertes Literal zu dem ausgewählten Parent-Element gefunden:<br>${this.literal}`);

            // Second is in progress: apply the literal
            let result = this.single(this.literal, this.mySet);

            // was set expected
            let wasExpected = this.compareSets(result, this.expectedChild);

            if (wasExpected) {
                console.log("Multy-is-expected:", result);
                this.mySet = result;

                this.updateUnused(false);
                this.handleUpdate();

                this.feedbackService.doubleMessage(`<br>Das Literal ${this.literal} wurde angewendet. Das Ergebnis entspricht dem eingegebenem Wert.`);

            } else {
                let expectedFormat = this.formatSet(this.expectedChild);
                let resultFormat = this.formatSet(result);

                console.log("Expected-not-right:", result);
                this.feedbackService.doubleMessage(`<br>Die Eingabe stimmt nicht mit dem Ergebnis nach Anwendung des Literals, ${this.literal}, überein:<br>Eingabe: ${expectedFormat}<br>Ergebnis: ${resultFormat}.`);
            }

        } else {
            // Try to find a single literal
            let isSingle = false;
            let literals = this.getSingleLiterals();

            if (literals.length !== 0) {
                // Single literals were found
                isSingle = true;
                // Update the id
                this.id = this.fromId + 1;

            } else {
                // Try to find multy literals
                literals = this.getMultyLiterals();

                if (literals.length !== 0) {
                    // Multy literals were found
                    // Update the id
                    this.id = calculateNextId(this.fromId);
                }
            }

            if (literals.length === 0) {
                console.log("No literal could be found!");
                this.feedbackService.doubleMessage(`<br>Es konnte kein Literal gefunden werden.`);
                return;
            }

            // Try to apply all literals till expected was reached
            for (let literal of literals) {

                // copy set
                let newSet = new Set(...[this.mySet]);

                // Apply the literal
                let result = this.single(literal, newSet);

                // was set expected
                let wasExpected = this.compareSets(result, this.expectedChild);

                if (wasExpected) {
                    console.log("Set was expected");
                    this.mySet = result;
                    this.literal = literal;

                    this.updateUnused(false);
                    this.handleUpdate();

                    // Multy: update the unused
                    if (!isSingle) {
                        let negatedLiteral = negateLiteral(literal);
                        let nextNId = calculateNextNegatedId(this.fromId);
                        let resultN = [nextNId, this.fromId, negatedLiteral];
                        this.unused.push(resultN);

                        this.feedbackService.doubleMessage(`<br>Es wurde ein Literal gefunden, dessen Ergebnis dem eingegebenen Wert entspricht.`);
                        this.feedbackService.doubleMessage(`Literal: ${this.literal}`);
                        this.feedbackService.doubleMessage(`Das Komplement des Literals wird zu dessen Parent-Element gespeichert.`);

                    } else {
                        this.feedbackService.doubleMessage(`<br>Es wurde ein Single Literal gefunden, dessen Ergebnis dem eingegebenen Wert entspricht.`);
                        this.feedbackService.doubleMessage(`Literal: ${this.literal}`);
                    }

                    break;

                } else {

                    if (isSingle) {
                        let expectedFormat = this.formatSet(this.expectedChild);
                        let resultFormat = this.formatSet(result);

                        this.feedbackService.doubleMessage(`Die Formel enthält ein Single-Literal.`);
                        this.feedbackService.doubleMessage(`Die Eingabe stimmt nicht einem Ergebnis nach Anwendung eines Single-Literals überein.<br>Mögliche Anwendung:<br>Literal: ${this.literal}<br>Eingabe: ${expectedFormat}<br>Ergebnis: ${resultFormat}.`);

                    } else {
                        let expectedFormat = this.formatSet(this.expectedChild);
                        let resultFormat = this.formatSet(result);

                        this.feedbackService.doubleMessage(`<br>Die Eingabe stimmt nicht einem Ergebnis nach Anwendung eines Literals überein.<br>Mögliche Anwendung:<br>Literal: ${this.literal}<br>Eingabe: ${expectedFormat}<br>Ergebnis: ${resultFormat}.`);
                    }
                }
            }
        }

        // Check finish
        let check = this.checkFinish();
        if (typeof check === 'boolean') {
            return check;
        } else {
            // not finished yet
            this.updateUnused(true);
        }

        return;
    }

    // Check if branch is finished and satisfiable
    checkFinish() {
        // Empty set: S = {} => true
        if (this.mySet.size === 0) {
            console.log("Ist Leere Menge");
            return true;
        }

        // Contains empty clause: S = {{}} => false
        let hasEmpty = this.hasEmpty(this.mySet);
        if (hasEmpty) {
            console.log("Enthält leere Menge");
            this.instanceOfTreeCreator.addContradictionNode(this.id, this.fromId);
            return false;
        }

        return;
    }

    // Update unused and not-finished
    updateUnused(add: boolean) {
        // Add: id not finished, add to unused
        // Remove = !add: result is expected, remove id from unused and unfinished
        if (!add) {
            // Remove id from unused
            this.removeUnused();
            // Remove id to from-id from unfinished
            this.removeUnfinished();

        } else {
            // Add id to unfinished
            this.unfinishedIds.push(this.id);
        }
    }

    // Remove id to from-id from unused
    removeUnused() {
        for (let i = 0; i < this.unused.length; i++) {
            let unuse = this.unused[i];
            if (this.id === unuse[0] && this.fromId === unuse[1]) {
                this.unused.splice(i, 1);
            }
        }
    }

    // Remove from-id from unfinished
    removeUnfinished() {
        const indexToRemove = this.unfinishedIds.indexOf(this.fromId);
        if (indexToRemove > -1) {
            this.unfinishedIds.splice(indexToRemove, 1);
        }
    }

    // Check if the set contains an empty clause
    hasEmpty(mySet: Set<string[]>): boolean {
        for (const clause of mySet) {
            if (clause.length === 0) {
                // clause was empty
                return true;
            }
        }
        return false;
    }

    // Check if the from-id is valid
    checkFromId(): boolean {
        console.log("check-from-id:", this.fromId, this.unfinishedIds, this.unused);

        // Is in range
        if (this.fromId >= 0) {
            
            // Is an unfinished id
            if (this.unfinishedIds.includes(this.fromId)) {
                console.log("is-unfinished:", this.fromId);
                return true;

            } else {

                // Check the negated literals
                for (let unused of this.unused) {

                    // Is an unused id
                    if (unused[1] === this.fromId) {
                        console.log("was-not-used:", this.fromId);
                        this.id = unused[0];
                        this.literal = unused[2];
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Get all single literals
    getSingleLiterals(): string[] {
        let literals: string[] = [];

        for (let clause of this.mySet) {

            // Get single clauses
            if (clause.length === 1) {
                let literal = clause[0];

                // Check if already in list
                if (literals.length !== 0) {
                    if (literals.includes(literal)) {
                        literals.push(literal);
                    }
                } else {
                    literals.push(clause[0]);
                }
            }
        }
        return literals;
    }

    // Get all literals
    getMultyLiterals(): string[] {
        let literals: string[] = [];

        for (let clause of this.mySet) {

            for (let literal of clause) {

                // Check if already in list
                if (!literals.includes(literal)) {
                    literals.push(literal);
                }
            }
        }
        return literals;
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

    deepCopySetOfArrays(originalSet: Set<string[]>): Set<string[]> {
        const newSet = new Set<string[]>();
    
        for (let array of originalSet) {
            // Copy each array within the sets
            const newArray = [...array]; // Create a copy of the array
            newSet.add(newArray); // Add the copied array to the set
        }
        return newSet;
    }

    formatSet(set: Set<string[]>): string {
        const formattedElements = Array.from(set)
            .map(arr => `{${arr.join(",")}}`) // Enclose each `string[]` in `{}` and separate it with `,`
            .join(";");                       // Separate the single `{...}`-blocks with `;`
        
        return `{${formattedElements}}`;      // Enclose the output in `{}`
    }

    compareSets(setA: Set<string[]>, setB: Set<string[]>) {
        // an empty set contains only empty strings
        if (this.setOfArraysWithOnlyEmptyStrings(setA)) {
            setA = new Set();
        }
        if (this.setOfArraysWithOnlyEmptyStrings(setB)) {
            setB = new Set();
        }
        if (setA.size !== setB.size) {
            return false;
        }

        // compare two arrays independent from their order
        const areArraysEqualUnordered = (arrA: string | any[], arrB: string | any[]): boolean => {
            if (arrA.length !== arrB.length) return false;
            const sortedA = [...arrA].sort();
            const sortedB = [...arrB].sort();
            return sortedA.every((value, index) => value === sortedB[index]);
        };

        // check if each element of array a is in array b
        for (let arrayA of setA) {
            let foundMatch = false;
            for (let arrayB of setB) {
                if (areArraysEqualUnordered(arrayA, arrayB)) {
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch) {
                return false;
            }
        }
        return true;
    }

    setOfArraysWithOnlyEmptyStrings(set: Set<string[]>): boolean {
        console.log("set-of-empty:", set);
        for (let arr of set) {
            for (let str of arr) {
                if (str !== "") {
                    return false;
                }
            }
        }
        return true;
    }

    getUnused() {
        return this.unused;
    }

    formatUnused(): string[] {
        let formattedElements: string[] = [];
        for (let entry of this.unused) {
            let id = entry[0];
            let fromId = entry[1];
            let literal = entry[2];
            let entryStr = `${fromId}:${literal}`;
            formattedElements.push(entryStr);
        }
        return formattedElements;
    }

    getUnfinished() {
        return this.unfinishedIds;
    }

    handleUpdate() {

        // Update map
        this.updateMap();
        console.log("map:", this.customMap);

        // Update tree
        this.instanceOfTreeCreator.addNode(this.id, this.literal, this.mySet, this.fromId);

        // Handle click for parent
        this.handleParent(this.id);
    }

    updateMap() {
        
        // Convert Set to Array
        let myArray: string[][] = [...this.mySet];

        // Add entries to map
        let value: ValueType = { fromId:this.fromId, literal:this.literal, formula:myArray };
        this.customMap.setMapEntry(this.id, value);
    }

    handleParent(id: number) {
        const element = document.getElementById(id.toString());
        
        if (element !== null) {
            // click-listener only in excercise
            element.addEventListener('click', () => {
                // get the id of the element that was clicked on
                this.fromId = id;
    
                // remove the highlight-class from all ids
                this.instanceOfTreeCreator.removeClass('click');
                
                // highlight the span that was clicked on
                this.renderer.addClass(element, 'click');
            });
        }
    }
}
