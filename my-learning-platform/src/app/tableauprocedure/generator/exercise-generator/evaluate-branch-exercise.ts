import { Dictionary } from "../value-type";
import { FeedbackService } from "../../../feedback/feedback.service";

import { applyRuleOne } from "../apply-rules/rule-one";
import { applyRuleTwo, applyRuleFour } from "../apply-rules/rule-two-four";
import { applyRuleThreeFive } from "../apply-rules/rule-three-five";
import { applyRuleSeven, applyRuleSix } from "../apply-rules/rule-six-seven";
import { isLiteral, removeOuterParenthesis } from "../../../procedure-functions";


/**
 * This class is for evaluating the tableau by applying rules on it
 */
export class EvaluateBranchExercise {

    // ids of the new child/children
    newChildIds: number | number[] = 0;
    // list of branches
    branches: number[][] = [[]];
    
    // map of ids and their applied parent-ids for each branch
    // parent: applied-id indicating branch
    appliedOnBranches: Map<number, number[][]> = new Map;

    // ids of nodes that are created, but not applied yet
    notAppliedNodes: any[] = [];
    // ids of nodes containing a literal
    literalNodes: any[] = [];

    // possible nodes instead of input for given fromId
    /// fromId: childIds - rule, formula
    possibles: any[] = [];

    constructor(private instanceOfMap: Dictionary, private feedbackService: FeedbackService) {}

    reset() {
        this.appliedOnBranches = new Map;
        this.notAppliedNodes = [];
        this.newChildIds = 0;
        this.branches = [[]];
        this.literalNodes = [];
    }

    evaluateTableau(fromId: number, expectedFormula: string) {

        // add root id to branch
        if (fromId === 0) {
            this.branches.push([0]);
        }

        // get the formula from the fromId
        let parentFormula = this.instanceOfMap.getSpecificMapEntry(fromId, 'formula').toString();

        // get child ids
        let childIds = this.getChildIds(fromId);
        if (childIds.length === 0) {
            this.feedbackService.errorMessage(`Dieser Knoten: ${fromId} ist nicht frei`);
            return;
        }

        let ruleWasApplied = 0;
        let wasPossible = false;
        for (let childId of childIds) {
            // try to apply rules on node
            ruleWasApplied = this.applyRules(fromId, childId, parentFormula, expectedFormula);

            if (ruleWasApplied === 0) {
                if (!wasPossible) {
                    this.feedbackService.updateFeedback(`Mögliche Eingabe für Parent ${fromId}:`);
                    wasPossible = true;
                }
                if (wasPossible) {
                    this.feedbackService.doubleMessage(`\t Child-Id: ${childId}`);
                    for (let possible of this.possibles) {
                        this.feedbackService.doubleMessage(`\t\t Rule: ${possible[0]}, Formel: ${possible[1]}`)
                    }
                    this.possibles = [];
                }
            } else {
                this.possibles = [];
                this.feedbackService.updateFeedback(`Es konnte eine Formel für die Eingabe gefunden werden!`);
                break;
            }
        }
        if (ruleWasApplied === 0) {
            if (!wasPossible) {
                this.feedbackService.updateFeedback(`Es konnte keine Regel angewendet werden,<br>um die erwartete Formel, ${expectedFormula}, zu erhalten!`);
                this.possibles = [];
            }
            return;
        }

        this.instanceOfMap.displayMapEntries();
        return this.instanceOfMap;
    }

    applyRules(fromId: number, nextId: number, formula: string, expectedChild: string): number {
        let ruleWasApplied = 0;
        
        // trim the outer parenthesis
        formula = removeOuterParenthesis(formula);

        // Reihenfolge: 7 <->, 6 ->, 1 !!, 2 &, 4  |, 3 !|, 5 !&
        let formulaSeven = applyRuleSeven(formula);

        if (formulaSeven !== "") {
            if (formulaSeven === expectedChild) {
                this.changeEntry(nextId, fromId, 7, formulaSeven);

                // add new id to branch
                this.addNodeToBranch(nextId);
                // handle not applied
                this.updateAppliedOnBranch(fromId, nextId);

                // check if formula is only variable or its negation
                this.handleVariable(nextId, formula);

                ruleWasApplied = 7;
                this.newChildIds = nextId;
                return ruleWasApplied;
            }
            this.possibles.push([7, formulaSeven]);
            return 0;
        }

        let formulaSix = applyRuleSix(formula);

        if (formulaSix !== "") {
            if (formulaSix === expectedChild) {
                this.changeEntry(nextId, fromId, 6, formulaSix);

                // add new id to branch
                this.addNodeToBranch(nextId);
                // handle not applied
                this.updateAppliedOnBranch(fromId, nextId);

                // check if formula is only variable or its negation
                this.handleVariable(nextId, formula);

                ruleWasApplied = 6;
                this.newChildIds = nextId;
                return ruleWasApplied;
            }
            this.possibles.push([6, formulaSix]);
            return 0;
        }

        let formulaOne = applyRuleOne(formula);

        if (formulaOne !== "") {
            if (formulaOne === expectedChild) {
                this.changeEntry(nextId, fromId, 1, formulaOne);

                // add new id to branch
                this.addNodeToBranch(nextId);
                // handle not applied
                this.updateAppliedOnBranch(fromId, nextId);

                // check if formula is only variable or its negation
                this.handleVariable(nextId, formula);

                console.log("Rule1:", nextId, this.instanceOfMap.getMapEntry(nextId));
                ruleWasApplied = 1;
                this.newChildIds = nextId;
                return ruleWasApplied;
            }
            this.possibles.push([1, formulaOne]);
        }

        let couldBeTwo = false;    // avoid OR after AND
        if (expectedChild.includes('&')) {
            let formulaTwo = applyRuleTwo(formula);

            if (formulaTwo.length !== 0) {
                let expectedChildren = expectedChild.split('&&');
                
                if (expectedChild.includes('&&')) {
                    // remove parenthesis from inner expected
                    let upperExpected = removeOuterParenthesis(expectedChildren[0]);
                    let lowerExpected = removeOuterParenthesis(expectedChildren[1]);

                    if (upperExpected === formulaTwo[0] && lowerExpected === formulaTwo[1]) {

                        this.changeEntry(nextId, fromId, 2, formulaTwo[0]);     // upper
                        
                        // check if formula is only variable or its negation
                        this.handleVariable(nextId, formulaTwo[0]);

                        let lowerNextId = nextId;
                        if (lowerNextId.toString().includes('.')) {
                            let nextStr = lowerNextId.toString().split('.');
                            let next = +nextStr[0] + 1;
                            let lowerNextStr = next.toString() + '.' + nextStr[1];
                            lowerNextId = +lowerNextStr;
                        } else {
                            lowerNextId++;
                        }
                        this.changeEntry(lowerNextId, fromId, 2, formulaTwo[1]);   // lower

                        // check if formula is only variable or its negation
                        this.handleVariable(lowerNextId, formulaTwo[1]);

                        // add new id to branch
                        this.addNodeToBranch(nextId);
                        this.addNodeToBranch(lowerNextId);
                        // handle not applied
                        this.updateAppliedOnBranch(fromId, lowerNextId);

                        console.log("Rule2:", nextId, this.instanceOfMap.getMapEntry(nextId));
                        console.log("Rule2:", lowerNextId, this.instanceOfMap.getMapEntry(lowerNextId));
                        ruleWasApplied = 2;
                        this.newChildIds = [nextId, lowerNextId];
                        return ruleWasApplied;
                    }
                }
                this.possibles.push([2, `${formulaTwo[0]} && ${formulaTwo[1]}`]);
                couldBeTwo = true;
            }
        }

        if (expectedChild.includes('|') && !couldBeTwo) {
            let formulaFour = applyRuleFour(formula);

            if (formulaFour.length !== 0) {
                let expectedChildren = expectedChild.split('||');
                
                if (expectedChild.includes('||')) {
                    // remove parenthesis from inner expected
                    let firstExpected = removeOuterParenthesis(expectedChildren[0]);
                    let secondExpected = removeOuterParenthesis(expectedChildren[1]);

                    if (firstExpected === formulaFour[0] && secondExpected === formulaFour[1]) {

                        let nextIdLeft = this.handleSiblingId(nextId, false);
                        let nextIdRight = this.handleSiblingId(nextId, true);

                        this.changeEntry(nextIdLeft, fromId, 4, formulaFour[0]);   // left

                        // create new branches
                        this.handleSplit(nextId, nextIdLeft, nextIdRight);
                        // handle not applied
                        this.updateAppliedOnBranch(fromId, nextIdLeft);
                        // check if formula is only variable or its negation
                        this.handleVariable(nextIdLeft, formulaFour[0]);

                        // handle right not applied
                        let withoutCurrent = Array.from(this.notAppliedNodes);
                        let index = withoutCurrent.indexOf(fromId);
                        withoutCurrent.splice(index, 1);
                        
                        this.changeEntry(nextIdRight, fromId, 4, formulaFour[1]);   // right
                        // handle not applied
                        this.updateAppliedOnBranch(fromId, nextIdRight);
                        // check if formula is only variable or its negation
                        this.handleVariable(nextIdRight, formulaFour[1]);

                        console.log("left", nextIdLeft, this.instanceOfMap.getMapEntry(nextIdLeft));
                        console.log("right", nextIdRight, this.instanceOfMap.getMapEntry(nextIdRight));
                        ruleWasApplied = 4;
                        this.newChildIds = [nextIdLeft, nextIdRight];
                        return ruleWasApplied;
                    }
                }
                this.possibles.push([4, `${formulaFour[0]} || ${formulaFour[1]}`]);
            }
        }

        let formulaThreeFive = applyRuleThreeFive(formula);

        console.log("ThreeFive", formulaThreeFive);
        if (formulaThreeFive !== "") {
            if (formulaThreeFive[1] === expectedChild) {
                this.changeEntry(nextId, fromId, +formulaThreeFive[0], formulaThreeFive[1].toString());

                // check if formula is only variable or its negation
                this.handleVariable(nextId, formula);
    
                // add new id to branch
                this.addNodeToBranch(nextId);
                // handle not applied
                this.updateAppliedOnBranch(fromId, nextId);
    
                console.log("Rule", formulaThreeFive[0], ":", nextId, this.instanceOfMap.getMapEntry(nextId));
                ruleWasApplied = +formulaThreeFive[0];
                this.newChildIds = nextId;
                return ruleWasApplied;
            }
            this.possibles.push([+formulaThreeFive[0],formulaThreeFive[1]]);
        }
        return ruleWasApplied;
    }

    addNodeToBranch(nextId: number) {
        // add all new ids to current branch
        for (let branch of this.branches) {
            if (branch.length !== 0) {
                let containerId = this.handleContainerId(nextId);
                if (branch.includes(containerId)) {
                    branch.push(nextId);
                }
            }
        }
        this.branches = this.branches.filter(subArray => subArray.length > 0);
    }
    handleSplit(nextId: number, nextIdLeft: number, nextIdRight: number) {
        let oldBranch: number[] = [];
        let prevId: number;

        if (nextId.toString().includes('.')) {
            let numberStr = nextId.toString().split('.');
            let intPart = parseFloat(numberStr[0]) - 1;
            prevId = parseFloat(intPart + '.' + numberStr[1]);
        } else {
            prevId = this.handleContainerId(nextId);
        }

        // remove current branch
        for (let branch of this.branches) {
            if (branch.includes(prevId)) {
                oldBranch = [...branch];
            }
        }
        this.branches = this.branches.filter(subBranch => !subBranch.includes(prevId));

        // add new branches
        let newBranchLeft = [...oldBranch];
        newBranchLeft.push(nextIdLeft);
        let newBranchRight = [...oldBranch];
        newBranchRight.push(nextIdRight);
        this.branches.push(newBranchLeft);
        this.branches.push(newBranchRight);

        console.log("branches split:", this.branches);
    }
    updateAppliedOnBranch(fromId: number, nextId: number) {
        // add fromId: branch to Map of applied on branches if nextFormula is not a literal
        for (let branch of this.branches) {
            if (branch.includes(nextId)) {
                if (this.appliedOnBranches.has(fromId)) {
                    // Get the existing list and add a branch
                    const existingList = this.appliedOnBranches.get(fromId);
                    if (existingList !== undefined && existingList.length !== 0) {
                        existingList.push(branch);
                    }
                } else {
                    // Add a new branch if key is not used
                    this.appliedOnBranches.set(fromId, [branch]);
                }
            }
        }
        // for (let key of this.appliedOnBranches.keys()) {
        //     console.log("applied-on:", key, this.appliedOnBranches.get(key));
        // }
    }

    unusedNodesExists(): boolean {
        // all nodes should be applied on all branches
        // console.log("unused-nodes", this.notAppliedNodes);
        if (this.notAppliedNodes.length === 0) {
            return false;
        }
        return true;
    }

    getChildIds(fromId: number): number[] {
        // check each branch if the rule could be applied on
        let childIds = [];
        // check for split
        let keys = this.instanceOfMap.getKeys();

        // no floating number => no split => highest number
        if (keys.some(num => !Number.isInteger(num))) {
            // check if branch was applied
            let appliedBranches: number[][] | undefined = this.appliedOnBranches.get(fromId);
            for (let branch of this.branches) {
                if (appliedBranches === undefined) {
                    if (this.canBeInBranch(fromId, branch)) {
                        childIds.push(Math.max(...branch) + 1);
                    }
                    continue;
                }
                let wasApplied = false;
                for (let appliedBranch of appliedBranches) {
                    if (this.arrayContainsAnotherArray(branch, appliedBranch)) {
                        wasApplied = true;
                    }
                }
                if (!wasApplied) {
                    // fromId was not applied on branch
                    if (this.canBeInBranch(fromId, branch)) {
                        // fromId could be applied on branch
                        childIds.push(Math.max(...branch) + 1);
                    }
                }
            }
        } else {
            // no split yet, only integers
            childIds.push(Math.max(...keys) + 1);
        }

        return childIds;
    }

    handleContainerId(childId: number): number {
        let numberStr: string = childId.toString();
        if (numberStr.includes('.')) {
            let numberArr: string[] = numberStr.split('.');
            let intNum = +numberArr[0] - 1;
            numberStr = intNum.toString() + '.' + numberArr[1];
            return +numberStr;
        } else {
            return childId -1;
        }
    }

    areBranchesFinished(): boolean {
        let ids: number[] = this.instanceOfMap.getKeys();
        let wasUsed: number[] = [...this.appliedOnBranches.keys()];
        let isFinished: boolean = true;

        // right amount of used ids
        if (wasUsed.length + this.literalNodes.length !== ids.length) {
            console.log("not the right amount of used ids");
            isFinished = false;
        }

        for (let id of ids) {
            // id was used and is not a literal
            if (wasUsed.includes(id) && !this.literalNodes.includes(id)) {

                // branches that contains id
                for (let branch of this.branches) {
                    if (branch.includes(id)) {

                        // id was applied on branch
                        let isOk = false;
                        let appliedBranches = this.appliedOnBranches.get(id);

                        if (appliedBranches !== undefined) {
                            for (let appliedBranch of appliedBranches) {
                                isOk = this.arrayContainsAnotherArray(branch, appliedBranch);
                                if (isOk) {
                                    break;
                                }
                            }
                            if (!isOk) {
                                // id was not applied on branch yet
                                this.feedbackService.doubleMessage(`Id: ${id} wurde in Branch: ${branch.join(',')} noch nicht angewendet.`);
                                isFinished = false;
                            }
                        }
                    }
                }
            } else {
                if (!this.literalNodes.includes(id)) {
                    this.feedbackService.doubleMessage(`Id: ${id} wurde noch nicht angewendet!`);
                }
            }
        }
        return isFinished;
    }

    canBeInBranch(fromId: number, branch: number[]): boolean {
        let fromString = fromId.toString();
        if (fromString.includes('.')) {
            let branchId = fromString.split('.');
            for (let id of branch) {
                // branch contains branchId of fromId
                if (id.toString().split('.')[1] === branchId[1]) {
                    return true;
                }
            }
        } else {
            // all ids of the original branch needs to be applied on all branches
            return true;
        }
        return false;
    }

    arrayContainsAnotherArray(superset: number[], subset: number[]): boolean {
        let contains =  subset.every(value => superset.includes(value));
        return contains;
    }

    getBranches(): number[][] {
        return this.branches;
    }

    getNewIds(): number | number[] {
        return this.newChildIds;
    }

    handleSiblingId(id: number, isRight: boolean): number {
        let idString = id.toString();

        // already a splitted branch
        if (idString.includes('.')) {
            if (isRight) {
                idString += "2";
            } else {
                idString += "1";
            }
        } else {
            if (isRight) {
                idString += ".2";
            } else {
                idString += ".1";
            }
        }
        return +idString;
    }

    handleVariable(id: number, formula: string) {
        // if formula is only variable or its negation => do not apply
        
        formula = removeOuterParenthesis(formula);
        if (!isLiteral(formula)) {
            this.notAppliedNodes.push(id);
        } else {
            if (!this.literalNodes.includes(id)) {
                this.literalNodes.push(id);
            }
        }
    }

    changeEntry(id:number, fromId:number, rule:number, formula:string) {
        formula = removeOuterParenthesis(formula);
        let value = { fromId:fromId, rule:rule, formula:formula };
        this.instanceOfMap.setMapEntry(id, value);
        console.log("map updated:", this.instanceOfMap.getMap());
    }
}
