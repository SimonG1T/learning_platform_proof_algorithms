import { Renderer2 } from "@angular/core";
import { TreeCreator } from "./tree-creator";
import { Dictionary } from "./value-type-full";
import { negateLiteral } from "../../procedure-functions";


/**
 * Example and Test:
 * Fulfilability-test of the resolution procedure
 * Set ( [literal] )
 */
export class EvaluateResolutionProcedure {

    instanceOfTreeCreator = new TreeCreator(this.renderer);

    // private instanceOfMap: Dictionary = new Dictionary;
    private newSet:any[] = [];
    private wasUsed = 0;
    private parent_1 = 0;
    private parent_2 = 0;
    private newWasCreated = false;
    private newCreated: any[] = [];
    private greenList: [number, number][] = [];
    private redList: [number, number][] = [];
    private contradiction: any[] = [];

    constructor(private renderer: Renderer2, private instanceOfMap: Dictionary, private type: string = '') {}

    reset() {
        this.instanceOfMap.clearMap();
        this.newSet = [];
        this.wasUsed = 0;
        this.parent_1 = 0;
        this.parent_2 = 0;
        this.newCreated = [];
        this.greenList = [];
        this.redList = [];
        this.contradiction = [];
    }

    // Apply the procedure
    createFullResolution(clauseSet: Set<string[]>) {
        this.newWasCreated = false;

        if (this.instanceOfMap.getSize() === 0) {
            let i = 0;
            console.log("wurzel");
            
            // Add root in CNF to Map
            let arrWithParentheses:string[] = Array.from(clauseSet, arr => `{${arr.join(",")}}`);
            this.instanceOfMap.setMapEntry(i, { fromIds:[-1], clause: arrWithParentheses });
            // create the node
            this.instanceOfTreeCreator.generateTable(this.instanceOfMap, i);

            if (this.type === 'example') {
                return;
            }
        }

        if (this.instanceOfMap.getSize() === 1) {
            let i = 1;
            console.log("base creator");

            // Add original disjunctions to Map
            for (let clause of clauseSet) {
                let value = { fromIds:[0], clause:clause };
                this.instanceOfMap.setMapEntry(i, value);

                // create the node
                this.instanceOfTreeCreator.generateTable(this.instanceOfMap, i);
                i++;
            }

            if (this.type === 'example') {
                return;
            }
        }

        let formula = Array.from(clauseSet);

        // Empty set: S = {} => true
        if (formula.length === 0) {
            console.log("Ist Leere Menge");
            return false;
        }

        if (this.type === 'test') {
            return this.resolute(formula);

        } else if (this.type === 'example') {
            return this.resoluteOne();
        }
        return;
    }

    // Handle procedure for test
    resolute(oldArr: string[][]) {

        // Contains empty clausel: {{}}
        let containsEmpty = this.instanceOfMap.containsEmptyFormula();
        if (typeof containsEmpty === 'number') {
            console.log("enthält leere clausel");
            return false;
        }

        // Resolute all original literals
        let arr = this.resoluteAllLiterals(oldArr);
        if (typeof arr === 'boolean') {
            return false;
        }
        console.log("new-created:", this.newCreated, this.wasUsed);

        // Resolute all new literals until no new were created
        while (this.newCreated.length !== 0) {
            this.newCreated = [];

            arr = this.resoluteAllLiterals(arr);
            if (typeof arr === 'boolean') {
                return false;
            }

            console.log("new-created-literals:", this.newCreated);
        }

        return true;
    }

    // Handle resolution for example
    resoluteOne(): undefined | boolean {

        // Contains empty clausel: {{}}
        let containsEmpty = this.instanceOfMap.containsEmptyFormula();
        if (typeof containsEmpty === 'number') {
            console.log("enthält leere clausel");
            return false;
        }

        // Contains contradiction: Add empty set
        if (this.hasContradiction()) {
            console.log("enthält Widerspruch, füge leere clausel hinzu");
            this.addContradictionNode();
            return false;
        }

        // Check parent ids
        this.isParentValid(this.parent_1);
        this.isParentValid(this.parent_2);
        // Sort parent ids
        [this.parent_1,this.parent_2] = [this.parent_1,this.parent_2].sort((a, b) => a - b) as [number, number];
        // Get parents
        let first = this.instanceOfMap.getSpecificFormula(this.parent_1);
        let second = this.instanceOfMap.getSpecificFormula(this.parent_2);

        this.resolutePair(this.parent_1, this.parent_2, first, second);

        // Contains empty clausel: {{}}
        if (this.newWasCreated) {
            let lastFormula = this.instanceOfMap.getLastFormula();

            if (lastFormula.length === 0) {
                console.log("ist leere clausel");
                return false;
            }
        }

        console.log("end");
        return;
    }

    // Check if map contains contradictions
    hasContradiction(): boolean {
        let nodes = new Map();
        let singleClausel = [];
        let values = this.instanceOfMap.getValuesOfType('clause');
        let clausels = values.slice(1);

        // Check if the single clauses are contradictions
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
                    console.log("Enthält Widerspruch:", literal, id, id_2);

                    return true;
                }
            }
            i++;
        }
        return false;
    }

    // Check if an array contains contradictions
    arrHasContradiction(arr: string[]): boolean {
        for (let literal of arr) {
            let negatedLiteral = negateLiteral(literal);
            if (arr.includes(negatedLiteral)) {
                return true;
            }
        }
        return false;
    }

    // Round to resolute all literals for test
    resoluteAllLiterals(oldArr: string[][]): boolean | string[][] {
        let start = this.wasUsed+1;
        let end = this.instanceOfMap.getSize()-1;
        let arr: string[][] = [];

        for (let i = 0; i < end-1; i++) {

            if (start === i) {
                start++;
            }
            for (let j = start; j < end; j++) {
                this.wasUsed = j;

                this.resolutePair(i+1, j+1, oldArr[i], oldArr[j]);

                // new array
                arr = [...oldArr, ...this.newSet];

                // Contains empty clausel: {{}}
                let containsEmpty = this.instanceOfMap.containsEmptyFormula();
                if (typeof containsEmpty === 'number') {

                    this.addEmptyNode(containsEmpty);

                    console.log("enthält leere clausel");
                    return false;
                }

                // Contains contradiction: Add empty set
                if (this.hasContradiction()) {
                    console.log("enthält Widerspruch, füge leere clausel hinzu");
                    this.addContradictionNode();
                    return false;
                }
            }
        }

        return arr;
    }

    // Apply the resolution rule if it was not used yet
    resolutePair(i_1: number, i_2: number, first: string[], second: string[]) {
        // Greenlist: could create new line
        // Redlist: could not create new line

        console.log("pair:", i_1, i_2, first, second);

        if (this.tryResolutePair(first, second)) {
            this.greenList.push([i_1, i_2]);

            // try to update map
            this.tryUpdateMap(i_1, i_2);
        } else {
            this.redList.push([i_1, i_2]);
        }
    }

    // Apply the resolution rule
    tryResolutePair(first: string[], second: string[]): boolean {
        // the conjunction contains a contradiction
        let containsContradictions = false;
        // merge lists
        let merged: string[] = [];
        merged = [...first, ...second];

        // Check if the clausels contain contradictions
        for (let literal of first) {
            console.log("literal of first:", literal, first);
            let negatedLiteral = negateLiteral(literal);

            if (second.includes(negatedLiteral)) {
                console.log("negated of second:", negatedLiteral, second);

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
                this.newSet.push(arr);
            }
        }

        return containsContradictions;
    }

    getResultMap(result: boolean): Map<string,any> {
        let greenList = this.greenList;
        let redList = this.redList;
        let arrays = this.instanceOfMap.getValuesOfType('clause');

        // Map attributes: result, array, greenList, redList
        let myMap = new Map();
        myMap.set("result", result);
        myMap.set("quantity", arrays);
        myMap.set("greenList", greenList);
        myMap.set("redList", redList);
        return myMap;
    }

    getGRLists() {
        return [this.greenList, this.redList];
    }

    getNewCreated() {
        return this.newCreated;
    }
    resetNewCreated() {
        this.newCreated = [];
    }

    getNewWasCreated() {
        return this.newWasCreated;
    }

    setParent(parent: number, second=false, invalid=false) {
        let clickClass = 'click';

        if (second) {
            this.parent_2 = parent;
        } else {
            this.parent_1 = parent
        }

        // remove the highlight-class from all ids
        this.instanceOfTreeCreator.removeClicked();

        // highlight the parents
        let element1 = document.getElementById(this.parent_1.toString());
        let element2 = document.getElementById(this.parent_2.toString());

        if (invalid) {
            // highlight invalid if example
            clickClass = 'click-invalid';
        }
        if (element1 !== null && this.parent_1 !== 0) {
            this.renderer.addClass(element1, clickClass);
        }
        if (element2 !== null && this.parent_2 !== 0) {
            this.renderer.addClass(element2, clickClass);
        }
    }

    isParentValid(parentId: number): boolean {
        if (typeof parentId === 'number' && parentId > 0 && this.instanceOfMap.getSize() <= parentId) {
            return true;
        }
        return false;
    }

    addEmptyNode(key: number) {
        let fromIds = this.instanceOfMap.getSpecificFromIds(key);
        // id of empty nodes
        let id = fromIds[0];
        let id_2 = fromIds[1];
        this.contradiction.push('{}',id,id_2);
    }

    getContradiction() {
        // [literal, id, id_2]
        return this.contradiction;
    }

    addContradictionNode() {
        let literal = this.contradiction[0];
        let id = this.contradiction[1];
        let id_2 = this.contradiction[2];
        this.newSet.push([]);

        this.updateMap(id, id_2);
    }

    tryUpdateMap(i_1: number, i_2: number) {
        let clauseValue = this.newSet[this.newSet.length-1];
        let contains = this.instanceOfMap.valueIsInDictionary('clause', clauseValue);

        if (!contains) {
            // not already used
            this.updateMap(i_1, i_2);
        }
    }

    updateMap(i_1: number, i_2: number) {
        let mapSize = this.instanceOfMap.getSize();

        let newOne = mapSize-1;
        this.newCreated.push(newOne);
        console.log("new-one:", newOne);

        let value = { fromIds:[i_1,i_2], clause: this.newSet[this.newSet.length-1] };
        this.instanceOfMap.setMapEntry(mapSize, value);

        // create the node
        this.instanceOfTreeCreator.generateTable(this.instanceOfMap, mapSize);

        this.newWasCreated = true;
    }

    getDictionary() {
        return this.instanceOfMap;
    }
}
