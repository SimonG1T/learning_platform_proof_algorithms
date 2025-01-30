import { Dictionary } from "../value-type";

import { applyRuleOne } from "../apply-rules/rule-one";
import { applyRuleThreeFive } from "../apply-rules/rule-three-five";
import { applyRuleTwo, applyRuleFour } from "../apply-rules/rule-two-four";
import { applyRuleSix, applyRuleSeven } from "../apply-rules/rule-six-seven";
import { removeOuterParenthesis } from "../../../procedure-functions";


/** 
 * This class is for evaluating the tableau by applying rules on it
 */
export class EvaluateBranch {

    private branch: number[] = []   // current branch
    private newIds: number | number[] = [];  // new ids that were created during rule application

    // List of branches
    private branches: number[][] = [[]];
    // Map of ids and their applied branches
    private appliedOn: Map<number, number[][]> = new Map;

    constructor(private instanceOfMap: Dictionary) {}

    reset() {
        this.branch = [];
        this.newIds = [];
        this.branches = [[]];
        this.appliedOn.clear();
        this.instanceOfMap.clearMap();
    }

    // Apply the procedure
    evaluateBranch(fromId: number, branch: number[]) {
        console.log("from-id, branch:", fromId, branch);

        if (fromId === -1) {
            this.branches.pop();
            this.branches.push([0]);
            console.log("initial-branches:", this.branches);
            return;
        }

        this.branch = branch;
        console.log(this.branch, this.branches);

        // calculate the child id
        let childId = Math.max(...branch)+1;

        // try to apply rules on node
        let ruleWasApplied = this.applyRules(fromId, childId);
        if (ruleWasApplied === 0) {
            console.log("Something went wrong, no rule could be applied");
        }
        return ruleWasApplied;
    }

    applyRules(fromId: number, nextId: number): number {
        let ruleWasApplied = 0;
        
        // formula
        let formula = this.instanceOfMap.getSpecificMapEntry(fromId, "formula").toString();

        console.log("apply-rules:", fromId, nextId, formula);

        // trim the outer parenthesis
        formula = removeOuterParenthesis(formula);

        // Reihenfolge: 7 <->, 6 ->, 1 !!, 4  |, 2 &, 3 !|, 5 !&

        let formulaSeven = applyRuleSeven(formula);

        if (formulaSeven !== "") {
            this.changeEntry(nextId, fromId, 7, formulaSeven);
            console.log("Rule7:", nextId, this.instanceOfMap.getMapEntry(nextId));

            // handle id for branch and applied-on
            this.handleId(fromId, nextId);

            ruleWasApplied = 7;
            return ruleWasApplied;
        }

        let formulaSix = applyRuleSix(formula);

        if (formulaSix !== "") {
            this.changeEntry(nextId, fromId, 6, formulaSix);
            console.log("Rule6:", nextId, this.instanceOfMap.getMapEntry(nextId));

            // handle id for branch and applied-on
            this.handleId(fromId, nextId);

            ruleWasApplied = 6;
            return ruleWasApplied;
        }

        let formulaThreeFive = applyRuleThreeFive(formula);

        if (formulaThreeFive !== "") {
            this.changeEntry(nextId, fromId, +formulaThreeFive[0], formulaThreeFive[1].toString());
            console.log("Rule", formulaThreeFive[0] + ":", nextId, this.instanceOfMap.getMapEntry(nextId));

            // handle id for branch and applied-on
            this.handleId(fromId, nextId);

            ruleWasApplied = +formulaThreeFive[0];
            return ruleWasApplied;
        }

        let formulaFour = applyRuleFour(formula);

        if (formulaFour.length !== 0) {
            // Get ids for the siblings
            let [nextIdLeft, nextIdRight] = this.getSiblingIds(nextId);

            this.changeEntry(nextIdLeft, fromId, 4, formulaFour[0]);    // left
            this.changeEntry(nextIdRight, fromId, 4, formulaFour[1]);   // right

            console.log("Rule4:left", nextIdLeft, this.instanceOfMap.getMapEntry(nextIdLeft));
            console.log("Rule4:right", nextIdRight, this.instanceOfMap.getMapEntry(nextIdRight));

            // handle id for branch and applied-on
            this.handleSplit(fromId, nextIdLeft, nextIdRight);

            ruleWasApplied = 4;
            return ruleWasApplied;
        }
                
        let formulaTwo = applyRuleTwo(formula);

        if (formulaTwo.length !== 0) {
            this.changeEntry(nextId, fromId, 2, formulaTwo[0]);     // upper
            console.log("Rule2:upper", nextId, this.instanceOfMap.getMapEntry(nextId));

            // Get lower id
            let lowerNextId = nextId + 1;

            this.changeEntry(lowerNextId, fromId, 2, formulaTwo[1]);   // lower
            console.log("Rule2:lower", lowerNextId, this.instanceOfMap.getMapEntry(lowerNextId));

            // handle id for branch and applied-on
            this.handleId(fromId, nextId, lowerNextId);

            ruleWasApplied = 2;
            return ruleWasApplied;
        }

        let formulaOne = applyRuleOne(formula);

        if (formulaOne !== "") {
            this.changeEntry(nextId, fromId, 1, formulaOne);
            console.log("Rule1:", nextId, this.instanceOfMap.getMapEntry(nextId));

            // handle id for branch and applied-on
            this.handleId(fromId, nextId);

            ruleWasApplied = 1;
            return ruleWasApplied;
        }

        return ruleWasApplied;
    }

    // Add id(s) to branch and update applied-on
    handleId(fromId: number, id: number, secondId: number = -1) {
        if (secondId === -1) {
            this.newIds = id;
        } else {
            this.newIds = [id, secondId];
        }

        // Add id to branch
        this.addNodeToBranch(id);
        if (secondId !== -1) {
            this.addNodeToBranch(secondId);
        }

        // Update applied-on
        this.updateAppliedOn(fromId, id);
    }

    // Split the branch and update applied-on
    handleSplit(fromId: number, leftId: number, rightId: number) {
        this.newIds = [leftId, rightId];

        // Create new  branch by splitting current branch
        this.createNewBranch(leftId, rightId);

        // Update applied on
        this.updateAppliedOn(fromId, leftId);
        this.updateAppliedOn(fromId, rightId);
    }

    addNodeToBranch(id: number) {
        // add all new ids to current branch
        let copied = this.branches.map(innerArray => [...innerArray]);
        for (let branch of copied) {
            console.log(branch);
        }
        for (let branch of this.branches) {
            console.log("branch:", branch);
            if (branch.length !== 0) {
                // previous-id: id before the new one
                let prevId = this.branch[this.branch.length-1];
                console.log("prev:", prevId);

                if (branch.includes(prevId)) {
                    branch.push(id);
                }
            }
        }
        this.branches = this.branches.filter(subArray => subArray.length > 0);
        
        // display branches
        console.log("added-node:", id);
        let copiedBranches = this.branches.map(innerArray => [...innerArray]);
        for (let branch of copiedBranches) {
            console.log(branch);
        }
    }

    createNewBranch(leftId: number, rightId: number) {
        // Create new branch by splitting the current one
        let oldBranch: number[] = [];
        let prevId = this.branch[this.branch.length-1];;

        // remove current branch
        for (let branch of this.branches) {
            if (branch.includes(prevId)) {
                oldBranch = [...branch];
            }
        }
        this.branches = this.branches.filter(subBranch => !subBranch.includes(prevId));

        // add new branches
        let newBranchLeft = [...oldBranch];
        newBranchLeft.push(leftId);
        let newBranchRight = [...oldBranch];
        newBranchRight.push(rightId);
        this.branches.push(newBranchLeft);
        this.branches.push(newBranchRight);

        console.log("branches split:", this.branches);
    }

    updateAppliedOn(fromId: number, newId: number) {
        // Add branch as applied-on for from-id
        for (let branch of this.branches) {
            if (branch.includes(newId)) {
                console.log("branch-includes-id:", newId, branch);
                if (this.appliedOn.has(fromId)) {
                    console.log("applied-on-has-from:", this.appliedOn, fromId);
                    // Get the existing list and add a branch
                    const existingList = this.appliedOn.get(fromId);
                    if (existingList !== undefined && existingList.length !== 0) {
                        existingList.push(branch);
                    }
                } else {
                    // Add a new branch if key is not used
                    console.log("add-new-applied");
                    this.appliedOn.set(fromId, [branch]);
                }
            }
        }
    }

    // Get the ids for the siblings
    getSiblingIds(id: number): number[] {
        let left = 0;
        let right = 0;

        if (id % 1 === 0) {
            // Handle siblings for integer
            left = id + .1;
            right = id + .2;

        } else {
            // Handle siblings for float
            let idStr = id.toString();
            let leftStr = idStr + "1";
            let rightStr = idStr + "2";

            left = +leftStr;
            right = +rightStr;
        }

        console.log("sibling-ids:", left, right);

        return [left, right];
    }

    getBranches(): number[][] {
        return this.branches;
    }

    getWasAppliedOn() {
        return this.appliedOn;
    }

    getNewId(): number | number[] {
        return this.newIds;
    }

    changeEntry(id:number, fromId:number, rule:number, formula:string) {
        formula = removeOuterParenthesis(formula);
        let value = { fromId:fromId, rule:rule, formula:formula };
        this.instanceOfMap.setMapEntry(id, value);
    }
}
