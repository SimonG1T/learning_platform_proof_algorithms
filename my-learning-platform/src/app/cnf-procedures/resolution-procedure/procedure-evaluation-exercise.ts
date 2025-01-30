import { Renderer2 } from "@angular/core";
import { TreeCreator } from "./tree-creator";
import { Dictionary } from "./value-type-full";
import { FeedbackService } from "../../feedback/feedback.service";
import { negateLiteral } from "../../procedure-functions";


/**
 * Exercise:
 * Fulfilabilitytest of the resolution procedure
 * 
 * Set ( [literal] )
 */
export class EvaluateResolutionProcedure {

    private instanceOfTreeCreator = new TreeCreator(this.renderer);

    private isSecondParent = false;  // indicates the parent ids
    private wasUsedOn = new Map;    // j-ids that were used on smaller i-ids :Map<number, Set<number>>
    private expectedChild: string[] = [];     // input - expected child
    private newSet: string[] = [];
    private parent_1 = 0;
    private parent_2 = 0;
    private newWasCreated = false;
    private contradiction: any[] = [];

    constructor(private renderer: Renderer2, private instanceOfMap: Dictionary, private feedbackService: FeedbackService) {}

    reset() {
        this.expectedChild = [];
        this.isSecondParent = false;
        this.instanceOfMap.clearMap();
        this.wasUsedOn = new Map;  // pi: pjs
        this.newSet = [];
        this.parent_1 = 0;
        this.parent_2 = 0;
        this.contradiction = [];
    }
    
    initialCreation(clauseSet: Set<string[]>): boolean | undefined {

        let i = 0;
        
        // Add root in CNF to Map
        let arrWithParentheses:string[] = Array.from(clauseSet, arr => `{${arr.join(",")}}`);
        this.instanceOfMap.setMapEntry(i, { fromIds:[-1], clause: arrWithParentheses });

        // create the node
        this.instanceOfTreeCreator.generateTable(this.instanceOfMap, i);

        i = 1;

        // Add original disjunctions to Map
        for (let clause of clauseSet) {
            let value = { fromIds:[0], clause:clause };
            this.instanceOfMap.setMapEntry(i, value);

            // Create the node
            this.instanceOfTreeCreator.generateTable(this.instanceOfMap, i);

            // Make node clickable
            this.addClick(i);

            i++;
        }

        let formula = Array.from(clauseSet);

        // Empty set: S = {} => true
        if (formula.length === 0) {
            this.feedbackService.doubleMessage('Ist leere Mengel!');
            return false;
        }

        return;
    }

    // Apply procedure
    resolute(formula: string[]): undefined | boolean {
        this.newWasCreated = false;

        // Save expected input for comparison
        if (formula.length === 1 && formula[0].length === 0) {
            this.expectedChild = [];
        } else {
            this.expectedChild = formula;
        }

        // Contains empty clause: {{}}
        let containsEmpty = this.instanceOfMap.containsEmptyFormula();
        if (typeof containsEmpty === 'number') {
            this.feedbackService.doubleMessage('Enthält leere Clausel!');
            return false;
        }

        // Contains contradiction: Add empty set
        if (this.hasContradiction()) {
            this.feedbackService.doubleMessage('Enthält Widerspruch: Eine leere Clausel ist möglich!');
        }

        // Check parent ids
        let validParents = this.areParentsValid();
        if (!validParents) {
            this.feedbackService.doubleMessage(`Invalide Auswahl der Eltern: ${this.parent_1}, ${this.parent_2}!`);
            return;
        }
        // Sort parent ids
        [this.parent_1,this.parent_2] = [this.parent_1,this.parent_2].sort((a, b) => a - b) as [number, number];
        // Get parents
        let first = this.instanceOfMap.getSpecificFormula(this.parent_1);
        let second = this.instanceOfMap.getSpecificFormula(this.parent_2);

        this.resolutePair(this.parent_1, this.parent_2, first, second);

        // Contains empty clause: {{}}
        if (this.newWasCreated) {
            let lastFormula = this.instanceOfMap.getLastFormula();

            if (lastFormula.length === 0) {
                this.contradiction.push('',this.parent_1,this.parent_2);
                this.feedbackService.doubleMessage('Ergebnis ist eine leere Klausel!');
                return false;
            }
        } else {
            this.feedbackService.doubleMessage('Es wurde keine neue Klausel erzeugt!');
        }

        return;
    }

    // Check if the single clauses are contradictions
    hasContradiction(): boolean {
        let nodes = new Map();
        let singleClausel = [];
        let values = this.instanceOfMap.getValuesOfType('clause');
        let clausels = values.slice(1);

        let i = 1;
        for (let clausel of clausels) {
            if (clausel.length === 1) {
                let literal = clausel[0].toString();
                let negatedLiteral = negateLiteral(literal);
                singleClausel.push(literal);
                nodes.set(literal,i);

                if (singleClausel.includes(negatedLiteral)) {

                    // id of contradicted nodes
                    let id = +nodes.get(negatedLiteral);
                    let id_2 = this.instanceOfMap.getKeysByValue(literal, 'clause')[0];
                    this.contradiction.push(literal,id,id_2);
                    console.log("contradiction:", this.contradiction);

                    return true;
                }
            }
            i++;
        }
        return false;
    }

    // Check if the clauses contain contradictions
    clausesContainContradictions(first: string[], second: string[]): boolean {
        for (let literal of first) {
            let negatedLiteral = negateLiteral(literal);

            if (second.includes(negatedLiteral)) {
                return true;
            }
        }
        return false;
    }

    // Checks if array/disjunction contains contradiction
    arrHasContradiction(arr: string[]): boolean {
        for (let literal of arr) {
            let negatedLiteral = negateLiteral(literal);
            if (arr.includes(negatedLiteral)) {
                return true;
            }
        }
        return false;
    }

    // Compare two arrays
    compareArrays(arr1: string[], arr2: string[]): boolean {
        // Check for same length
        if (arr1.length !== arr2.length) {
            return false;
        }
      
        // Check for same elements
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
      
        return true;
    }

    // Use the resolution rule on two pairs
    resolutePair(i_1: number, i_2: number, first: string[], second: string[]) {

        console.log("pair:", i_1, i_2, first, second);

        if (this.tryResolutePair(first, second)) {

            // Check if the expected input is the outcome of the parents
            let compare = this.compareArrays(this.expectedChild, this.newSet);
            if (compare) {

                // try to update map
                this.tryUpdateMap(i_1, i_2);
            } else {

                // not expected node
                this.feedbackService.doubleMessage(`Die Eingabe stimmt nicht mit dem Ergebnis überein!<br> Eingabe: {${this.expectedChild.toString()}}, Erwartet: {${this.newSet.toString()}}`)
            }
        } else {
            this.feedbackService.doubleMessage(`Es konnte kein komplementäres Paar für (${this.parent_1},${this.parent_2}) gefunden werden!`);
        }

    }

    tryResolutePair(first: string[], second: string[]): boolean {
        // the disjunctions contains a contradiction
        let containsContradictions = false;
        // merge lists
        let merged: string[] = [];
        merged = [...first, ...second];

        // Check if the clauses contain contradictions
        for (let literal of first) {
            let negatedLiteral = negateLiteral(literal);

            if (second.includes(negatedLiteral)) {

                // merge lists and remove contridicted literals
                merged = merged.filter(el => el !== literal);
                merged = merged.filter(el => el !== negatedLiteral);

                // filter duplicates of array
                let arr = Array.from(new Set([...merged]));

                // disjunction contains contradiction
                if (this.arrHasContradiction(arr)) {
                    continue;
                }
                
                containsContradictions = true;

                // filter duplicates of map
                this.newSet = arr;
            }
        }

        return containsContradictions;
    }

    setParent(parent: number) {
        if (this.isSecondParent) {
            this.parent_2 = parent;
            this.isSecondParent = false;
        } else {
            this.parent_1 = parent;
            this.isSecondParent = true;
        }

        // remove the highlight-class from all ids
        this.instanceOfTreeCreator.removeClicked();

        // highlight the parents
        let element1 = document.getElementById(this.parent_1.toString());
        let element2 = document.getElementById(this.parent_2.toString());
        if (element1 !== null && this.parent_1 !== 0) {
            this.renderer.addClass(element1, 'click');
        }
        if (element2 !== null && this.parent_2 !== 0) {
            this.renderer.addClass(element2, 'click');
        }
    }

    areParentsValid(): boolean {
        if (typeof this.parent_1 === 'number' && typeof this.parent_2 === 'number' &&
                this.parent_1 > 0 && this.parent_1 <= this.instanceOfMap.getSize() &&
                this.parent_2 > 0 && this.parent_2 <= this.instanceOfMap.getSize() &&
                this.parent_1 !== this.parent_2) {
            return true;
        }
        return false;
    }

    addNumberToSet(key: number, value: number): boolean {
        // Get the Set for the given key or initialize a new one
        if (!this.wasUsedOn.has(key)) {
            this.wasUsedOn.set(key, new Set<number>());
        }
      
        const valueSet = this.wasUsedOn.get(key)!; // The Set to the key
      
        // Check if value is in Set
        if (valueSet.has(value)) {
            return true;
        }
      
        // Add value to Set
        valueSet.add(value);
        return false;
    }

    checkSequenceInMap(map: Map<number, Set<number>>, endValue: number): boolean {
        let isComplete = true;
        let unusedIds = [];
        let missingResolvents = [];

        for (let i = 1; i <= endValue; i++) {
            let keys = [...map.keys()];
            if (map.size === 0 || !keys.includes(i)) {
                // keys missing
                unusedIds.push(i);
                isComplete = false;
            }
        }

        for (const [key, valueSet] of map) {
            // Check if row of numbers 'key+1' till 'endValue' is in Set
            for (let i = key + 1; i <= endValue; i++) {
                if (valueSet.has(i)) {
                    if (unusedIds.includes(endValue)) {
                        // Last was used as value
                        unusedIds.pop();
                    }
                } else {
                    missingResolvents.push([key,i]);
                    isComplete = false; // Number is missing in row
                }
            }
        }

        if (unusedIds.length !== 0) {
            this.feedbackService.doubleMessage(`Es wurden noch nicht alle ids angewendet:<br>${unusedIds}`);
        }
        if (missingResolvents.length !== 0) {
            let resStr = missingResolvents.map(res => `(${res})`).join(';');
            this.feedbackService.doubleMessage(`Es wurden noch nicht alle Resolventen angewendet:<br>${resStr}`);
        }
        if (unusedIds.length === 0 && missingResolvents.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    // Find the nodes that are impossible to resolute and remove them from neccessary
    findImpossibles(): number[][] {
        let impossibles = [];
        let mapSize = this.instanceOfMap.getSize();

        for (let i = 1; i < mapSize-1; i++) {
            let first = this.instanceOfMap.getSpecificFormula(i);

            for (let j = i+1; j < mapSize; j++) {
                let second = this.instanceOfMap.getSpecificFormula(j);
                let containsContradictions = this.clausesContainContradictions(first, second);

                if (!containsContradictions) {
                    impossibles.push([i,j]);
                }
            }
        }
        return impossibles;
    }
    
    isFinished(): boolean {
        // Add impossible ids to was-used-on
        let impossibles = this.findImpossibles();

        if (impossibles.length !== 0) {
            for (let res of impossibles) {
                this.addNumberToSet(res[0], res[1]);
            }
        }

        // Was-used-on is complete
        let isFinished = this.checkSequenceInMap(this.wasUsedOn, this.instanceOfMap.getSize()-1);

        if (isFinished) {
            this.feedbackService.doubleMessage('Es wurden alle Resolventen angewendet!');
        }
        return isFinished;
    }

    getContradiction() {
        console.log("end-contradiction:", this.contradiction);
        return this.contradiction;
    }

    tryUpdateMap(i_1: number, i_2: number) {
        let clauseValue = this.newSet;
        let contains = this.instanceOfMap.valueIsInDictionary('clause', clauseValue);

        if (!contains) {
            let wasUsed = this.addNumberToSet(i_1, i_2);

            if (wasUsed) {
                // already in use
                this.feedbackService.doubleMessage('Diese Resolvente wurde bereits angewendet!');
            } else {
                this.updateMap(i_1, i_2);
            }
            

        } else {
            // already in map
            this.feedbackService.doubleMessage('Ist bereits in der Map!');
            // try update was-used-on
            this.addNumberToSet(i_1, i_2);
        }
    }

    updateMap(i_1: number, i_2: number) {
        let newId = this.instanceOfMap.getSize();

        let value = { fromIds:[i_1,i_2], clause: this.newSet };
        this.instanceOfMap.setMapEntry(newId, value);

        // create the node
        this.instanceOfTreeCreator.generateTable(this.instanceOfMap, newId);

        // Make click able
        this.addClick(newId);

        this.newWasCreated = true;
    }

    addClick(id: number) {
        let element = document.getElementById(id.toString());
    
        if (element !== null) {
            // click-listener only in excercise
            element.addEventListener('click', () => {
                // get the id of the element that was clicked on
                this.setParent(id);
            });
        }
    }

    getDictionary() {
        return this.instanceOfMap;
    }
}
