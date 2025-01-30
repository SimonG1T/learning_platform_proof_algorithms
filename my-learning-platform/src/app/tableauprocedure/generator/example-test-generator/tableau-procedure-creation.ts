import { Renderer2 } from "@angular/core";
import { FeedbackService } from "../../../feedback/feedback.service";
import { TableStructureComponent } from "../../my-tree/table-structure/table-structure.component";
import { Dictionary } from "../value-type";
import { EvaluateBranch } from "./evaluate-branch";
import { ValidateTableau } from "../validate-tableau";
import { isLiteral, removeOuterParenthesis } from "../../../procedure-functions";
import { highlightInvalid } from "../../my-tree/table-structure/highlight-hover";


/**
 * Evaluate the tableau
 */
export class TableauProcedureEvaluation {
    // prevent overloading while testing
    private preventInfinity = 1;

    // handle appearance for example
    private isExample = false;

    // Id of the parent (that was clicked on)
    private parentId: number = -1;
    // Id of the lowest node in current branch
    private containerId: number = -1;

    private instanceOfEvaluateBranch = new EvaluateBranch(this.instanceOfMap);
    private instanceOfValidateTableau = new ValidateTableau();
    private instanceOfTableStructure = new TableStructureComponent(this.renderer);

    constructor(private instanceOfMap: Dictionary, private feedbackService: FeedbackService, private renderer: Renderer2) {}

    reset() {
        this.preventInfinity = 1;
        this.isExample = false;
        this.parentId = -1
        this.containerId = -1;
        this.instanceOfMap.clearMap();
        this.instanceOfEvaluateBranch.reset();
    }

    // Create the tableau for the example
    createExample(formula: string): number | number[] {
        if (this.instanceOfMap.size() === 0) {
            // create root
            this.isExample = true;

            this.handleRoot(formula);
            return 0;
        }

        if (this.instanceOfMap.size() === 1) {
            // get initial branch
            let branch = this.instanceOfEvaluateBranch.getBranches()[0];
            console.log("root-branch:", branch);

            // apply procedure
            this.createNodes(0, branch);

            let newId = this.instanceOfEvaluateBranch.getNewId();
            return newId;
        }

        // get next from-id and branch
        let next = this.getNext();
        console.log("next-id-branch:", next);
        if (next !== undefined) {

            let [fromId, branch] = next;

            // apply procedure
            this.createNodes(fromId, branch);

            let newId = this.instanceOfEvaluateBranch.getNewId();
            return newId;

        } else {
            this.instanceOfMap.displayMapEntries();
            return -1;
        }
    }

    // Create the tableau tree for the test
    createTableau(input: string) {

        // applying rules
        // if rule is 0 -> rule was not applied, try next rule until finished

        // empty string
        if (input === "") {
            this.feedbackService.updateFeedback(`Eingabe war leer!`);
            return;
        }

        // handle root
        if (this.instanceOfMap.size() === 0) {
            this.handleRoot(input);
        }

        // get initial branch
        let branch = this.instanceOfEvaluateBranch.getBranches()[0];
        console.log("root-branch:", branch);

        // apply procedure
        this.createNodes(0, branch);
    }

    createNodes(parentId: number, branch: number[]) {

        console.log(this.preventInfinity);
        if (this.preventInfinity > 10) {
            return;
        }
        this.preventInfinity++;

        this.parentId = parentId;
        this.containerId = branch[branch.length-1];

        // highlight parent for example
        if (this.isExample) {
            this.handleParentSelection();
        }

        // handle childs
        let oldLength = this.instanceOfMap.size();

        // apply on element
        this.instanceOfEvaluateBranch.evaluateBranch(parentId, branch);

        if (oldLength !== this.instanceOfMap.size()) {
            this.updateForm();
        }

        if (!this.isExample) {
            // recursive call to create the tableau for test
            this.recursive()
        }
    }

    recursive() {
        // get next from-id and branch
        let next = this.getNext();
        console.log("next-id-branch:", next);
        if (next !== undefined) {
            let [nextId, branch] = next;

            // apply procedure
            this.createNodes(nextId, branch);
        } else {
            this.instanceOfMap.displayMapEntries();

            // handle results
            this.handleResults();
        }
    }

    getNext(): [number,number[]] | undefined {
        // Get key and first branch:
        // where key is not literal
        // and key can be used on branch, but was not yet
        let branches = this.instanceOfEvaluateBranch.getBranches();
        let copiedBranches = branches.map(innerArray => [...innerArray]);
        console.log("get-next:", copiedBranches);

        let keys = this.instanceOfMap.getKeys();
        for (let key of keys) {
            let formula = this.instanceOfMap.getSpecificMapEntry(key, 'formula').toString();
            if (isLiteral(formula)) {
                // key points to a literal
                continue;
            }

            for (let branch of branches) {
                console.log("branch:", [...branch]);
                if (branch.includes(key)) {
                    // key is in branch
                    let appliedOn = this.instanceOfEvaluateBranch.getWasAppliedOn();
                    let copiedAppliedOn = deepCopyAppliedOn(appliedOn);
                    let appliedBranches = appliedOn.get(key);
                    if (appliedBranches === undefined) {
                        // not applied yet
                        return [key,branch];
                    } else {
                        let copiedAppliedBranches = appliedBranches.map(innerArray => [...innerArray]);
                        // Check if applied-on is part of branch
                        let isPartOf = containsSubarray(branch, appliedBranches);
                        if (isPartOf) {
                            // branch is part of applied-on
                            continue;
                        }
                        let applied = containsArray(appliedBranches, branch);
                        if (!applied) {
                            // key was not applied on branch yet
                            return [key,branch];
                        }
                    }
                }
                // if (this.canBeInBranch(key, branch)) {
                //     // can be in branch
                //     return [key, branch];
                // }
            }
        }
        return;
    }

    canBeInBranch(id: number, branch: number[]): boolean {
        // Check if id can be in branch
        if (id % 1 !== 0) {
            let idStr = id.toString();
            let idFloat = idStr.split('.')[1];
            for (let branchId of branch) {
                console.log("branch-ids:", branchId, idFloat);
                if (branchId.toString().split('.')[1] === idFloat) {
                    // branch contains float of id
                    console.log("is-same-float:");
                    return true;
                }
            }
        } else {
            // all ids of the original branch needs to be applied on all branches
            return true;
        }
        return false;
    }

    handleRoot(input: string) {
        let id: number = 0;

        // Add root
        if (this.instanceOfMap.size() === 0) {

            let root = removeOuterParenthesis(input);
            console.log("Wurzel", root);

            // update map
            this.instanceOfMap.setMapEntry(id, {fromId:-1, rule:0, formula:root});

            // Add root id to branch
            this.instanceOfEvaluateBranch.evaluateBranch(-1, []);

            // get container element
            let container = this.instanceOfTableStructure.selectContainer();
            // create node
            if (container !== null) {
                // create tree element
                let treeElement = this.instanceOfTableStructure.createTreeElement(container);
                // add root
                this.instanceOfTableStructure.addRoot(treeElement, root, this.instanceOfMap);
            }
        }
    }

    // Create the results sequential for example
    createResults(next: number): [boolean,boolean] {
        // get list of all branches
        let branches = this.instanceOfEvaluateBranch.getBranches();

        if (next < branches.length) {
            let path = branches[next];

            // check path for achievability
            let isValid = this.instanceOfValidateTableau.checkPath(this.instanceOfMap, path);

            // get last id from path
            let lastId = path[path.length-1];

            // add result elements to tree
            this.instanceOfTableStructure.addResultElement(lastId, isValid, path, this.instanceOfMap);

            if (!isValid) {
                // add click-invalid to parents
                highlightInvalid(path, this.instanceOfMap, true);
            }

            return [false, isValid];
        }

        // check each path for achievability
        let validPaths = this.instanceOfValidateTableau.checkPaths(this.instanceOfMap, branches);

        // check tableau for achievability
        let isAchievable = this.instanceOfValidateTableau.checkTableau(validPaths);

        return [true, isAchievable];
    }

    // Create results for test
    handleResults() {
        // get list of all branches
        let branches = this.instanceOfEvaluateBranch.getBranches();

        // check each path for achievability
        for (let path of branches) {
            // check path for achievability
            let isValid = this.instanceOfValidateTableau.checkPath(this.instanceOfMap, path);

            // get last id from path
            let lastId = path[path.length-1];

            // add result elements to tree
            this.instanceOfTableStructure.addResultElement(lastId, isValid, path, this.instanceOfMap);
        }

        // check all paths for achievability
        let validPaths = this.instanceOfValidateTableau.checkPaths(this.instanceOfMap, branches);

        // check tableau for achievability
        let isAchievable = this.instanceOfValidateTableau.checkTableau(validPaths);
        if (isAchievable) {
            this.feedbackService.finishedMessage('Nach dem Tableauverfahren ist die Formel <b>erfüllbar</b>, <br> es gibt einen Zweig, welcher keinen Widerspruch enthält!');
        } else {
            this.feedbackService.finishedMessage('Nach dem Tableauverfahren ist die Formel <b>nicht erfüllbar</b>, <br> es gibt keinen Zweig ohne Widerspruch!');
        }
    }

    handleParentSelection() {
        // remove previous highlights
        this.removeHighlight();
        
        // highlight the span that is parent
        let element = document.getElementById(this.parentId.toString());
        if (element !== null) {
            this.renderer.addClass(element, 'click-container');
        }
    }

    removeHighlight() {
        // remove the highlight-class from all ids         
        Array.from(document.querySelectorAll('.click-container')).forEach(
            (el) => el.classList.remove('click-container')
        );
        Array.from(document.querySelectorAll('.click-container-invalid')).forEach(
            (el) => el.classList.remove('click-container-invalid')
        );
    }

    updateForm() {
        // Add node with new created id
        let id = this.instanceOfEvaluateBranch.getNewId();
        // Id of the node that is before new node
        let containerId = this.containerId;

        if (typeof id === 'number') {
            let formula = this.instanceOfMap.getSpecificMapEntry(id, 'formula').toString();
            let rule = this.instanceOfMap.getSpecificMapEntry(id, 'rule').toString();
            this.instanceOfTableStructure.addChildElement(formula, containerId, rule, this.instanceOfMap);

        } else if (Array.isArray(id)) {
            let formula1 = this.instanceOfMap.getSpecificMapEntry(id[0], 'formula').toString();
            let formula2 = this.instanceOfMap.getSpecificMapEntry(id[1], 'formula').toString();
            let rule = this.instanceOfMap.getSpecificMapEntry(id[0], 'rule').toString();

            if (+rule === 2) {
                this.instanceOfTableStructure.addChildElement(formula1, containerId, rule, this.instanceOfMap);
                this.instanceOfTableStructure.addChildElement(formula2, id[0], rule, this.instanceOfMap);
            }
            if (+rule === 4) {
                let formulas = [formula1, formula2];
                this.instanceOfTableStructure.addChildElements(formulas, containerId, rule, this.instanceOfMap);
            }
        }
    }
}

function containsSubarray(superArray: number[], listOfSubArrays: number[][]): boolean {
    // checks if the super-array contains a array of the sub-list
    return listOfSubArrays.some(subArray =>
        superArray.some((_, index) =>
        superArray.slice(index, index + subArray.length).every((value, i) => value === subArray[i]))
    );
}

function deepCopyAppliedOn(map: Map<number, number[][]>): Map<number, number[][]> {
    const newMap = new Map;

    for (const [key,value] of map.entries()) {
        // deep copy of value-type
        const copiedValue = value.map(innerArray => [...innerArray]);
        newMap.set(key,copiedValue);
    }
    return newMap;
}

export function arraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
    return arr1.every((value, index) => value === arr2[index]);
}

export function containsArray(list: number[][], target: number[]): boolean {
    return list.some(array => arraysEqual(array, target));
}
