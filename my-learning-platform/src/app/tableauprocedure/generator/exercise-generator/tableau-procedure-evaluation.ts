import { Dictionary, ValueType } from "../value-type";
import { EvaluateBranchExercise } from "./evaluate-branch-exercise";
import { ValidateTableau } from "../validate-tableau";
import { Renderer2 } from "@angular/core";
import { TableStructureComponent } from "../../my-tree/table-structure/table-structure.component";
import { FeedbackService } from "../../../feedback/feedback.service";


/**
 * Evaluate the Tableau for exercise
 */
export class TableauProcedureEvaluation {

    // parent id for choosing the parent element
    private parentId: number = -1;
    // List for unused parents that are not variables
    private usedParents: number[] = [];
    // List of branches
    private branches: number[][] = [[]];

    private instanceOfEvaluateBranch = new EvaluateBranchExercise(this.customDict, this.feedbackService);
    private instanceOfValidateTableau = new ValidateTableau();
    
    // Tree Creator
    private instanceOfTableStructure: TableStructureComponent = new TableStructureComponent(this.renderer);
    
    constructor(private customDict: Dictionary, private renderer: Renderer2, private feedbackService: FeedbackService) {}

    reset() {
        this.customDict.clearMap();
        this.parentId = -1;
        this.usedParents = [];
        this.branches = [[]];
    }

    createTableau(input: string="", parentId: number=-1) {

        // applying rules
        // if rule is empty -> rule was not applied, try next rule until finished
        // finished, when var or !var

        // empty string
        if (input === "") {
            this.feedbackService.updateFeedback(`Eingabe war leer für Parent: ${parentId}!`);
            this.removeHighlight();
            return;
        }

        // handle root
        if (this.customDict.size() === 0) {
            this.handleRoot(input);
            this.removeHighlight();
            this.feedbackService.updateFeedback(`Die Wurzel wurde erstellt!`);
            return;
        }

        // handle child
        if (parentId >= 0) {
            this.handleChild(input, parentId);
        }

        // handle results
        this.branches = this.instanceOfEvaluateBranch.getBranches();
        if (this.branches.length !== 0) {
            let unused = this.instanceOfEvaluateBranch.unusedNodesExists();

            let isFinished = this.instanceOfEvaluateBranch.areBranchesFinished();

            // branches are finished
            if (isFinished) {
                this.handleResults();
            }
        }

        this.removeHighlight();
    }

    handleRoot(formula: string) {
        let id: number = 0;
        console.log("Root:", formula);

        // update map
        this.customDict.setMapEntry(id, {fromId:-1, rule:0, formula:formula});

        // get container element
        let container = this.instanceOfTableStructure.selectContainer();
        // create node
        if (container !== null) {
            let treeElement = this.instanceOfTableStructure.createTreeElement(container);
            // add root
            this.instanceOfTableStructure.addRoot(treeElement, formula, this.customDict);
    
            // handle the selection for the parent id
            this.setParentId(id);
            this.handleSelection(id);
        }
    }

    handleChild(formula: string="", parentId: number=-1) {
        let oldLength = this.customDict.size();

        // apply on element
        this.instanceOfEvaluateBranch.evaluateTableau(parentId, formula);

        if (oldLength !== this.customDict.size()) {
            let newIds = this.instanceOfEvaluateBranch.getNewIds();
            this.updateForm(newIds);
        }
    }

    // Create results
    handleResults() {
        // get list of all branches
        let branches = this.instanceOfEvaluateBranch.getBranches();

        // check each path for achievability
        for (let path of branches) {
            // check path for achievability
            let isValid = this.instanceOfValidateTableau.checkPath(this.customDict, path);

            // get last id from path
            let lastId = path[path.length-1];

            // add result elements to tree
            this.instanceOfTableStructure.addResultElement(lastId, isValid, path, this.customDict);
        }

        // check all paths for achievability
        let validPaths = this.instanceOfValidateTableau.checkPaths(this.customDict, branches);

        // check tableau for achievability
        let isAchievable = this.instanceOfValidateTableau.checkTableau(validPaths);
        if (isAchievable) {
            this.feedbackService.finishedMessage('Nach dem Tableauverfahren ist die Formel <b>erfüllbar</b>, <br> es gibt einen Zweig, welcher keinen Widerspruch enthält!');
        } else {
            this.feedbackService.finishedMessage('Nach dem Tableauverfahren ist die Formel <b>nicht erfüllbar</b>, <br> es gibt keinen Zweig ohne Widerspruch!');
        }
    }

    handleSelection(id: number) {
        // add event listener for choosing
        const div = document.getElementById(id.toString());
        let element;

        if (div === null) return;
        if (div.classList.contains('left') || div.classList.contains('right')) {
            element = Array.from(div.children).find(child => child.tagName === 'SPAN');
        } else {
            element = div.firstChild;
        }

        if (element === undefined || element === null ) return;
        element.addEventListener('click', () => {
            // get the id of the element that was clicked on
            this.setParentId(id);

            this.removeHighlight();
            
            // highlight the span that was clicked on
            if (element !== null) {
                this.renderer.addClass(element, 'click');
            }
        });
    }

    removeHighlight() {
        // remove the highlight-class from all ids         
        Array.from(document.querySelectorAll('.click')).forEach(
            (el) => el.classList.remove('click')
        );
    }

    updateForm(id: number | number[]) {

        if (typeof id === 'number') {
            let formula = this.customDict.getSpecificMapEntry(id, 'formula').toString();
            let rule = this.customDict.getSpecificMapEntry(id, 'rule').toString();

            this.instanceOfTableStructure.addChildElement(formula, this.parentId, rule, this.customDict);
            this.handleSelection(id);
        } else if (Array.isArray(id)) {
            let formula1 = this.customDict.getSpecificMapEntry(id[0], 'formula').toString();
            let formula2 = this.customDict.getSpecificMapEntry(id[1], 'formula').toString();
            let rule = this.customDict.getSpecificMapEntry(id[0], 'rule').toString();

            if (+rule === 2) {
                let containerId = this.instanceOfEvaluateBranch.handleContainerId(id[0]);
                this.instanceOfTableStructure.addChildElement(formula1, containerId, rule, this.customDict);
                this.instanceOfTableStructure.addChildElement(formula2, id[0], rule, this.customDict);
            }
            if (+rule === 4) {
                let formulas = [formula1, formula2];
                let containerId = this.handleLastDigitFromFloat(id[0]);
                this.instanceOfTableStructure.addChildElements(formulas, containerId, rule, this.customDict);
            }

            this.handleSelection(id[0]);
            this.handleSelection(id[1]);
        }
    }

    handleLastDigitFromFloat(childId: number): number {
        let precisionStr = childId.toString().substring(childId.toString().indexOf('.')+1);
        let precision = precisionStr.length;

        const number = childId -1;
        let numberStr = number.toString();
        const dotIndex = numberStr.indexOf('.');

        if (dotIndex !== -1) {
            numberStr = numberStr.slice(0, numberStr.indexOf('.') + precision);
            if (numberStr.endsWith('.')) {
                numberStr = numberStr.slice(0, -1);
            }
        }
        let float: number = parseFloat(numberStr);
        return float;
    }

    getParentId(): number {
        return this.parentId;
    }
    setParentId(id: number) {
        console.log("parent-id:", id);
        this.parentId = id;
    }
    getUsedParents(): number[] {
        return this.usedParents;
    }
}
