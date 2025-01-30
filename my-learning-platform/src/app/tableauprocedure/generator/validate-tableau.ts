import { negateLiteral, isLiteral } from "../../procedure-functions";
import { Dictionary } from "./value-type";

/**
 * This class is for valuating the tableau by valuating each branch
 */
export class ValidateTableau {

    checkTableau(validPaths: number[]): boolean {
        // if a branch is achievable, the tableau is achievable
        // there is a branch without contradiction
        let isAchievable = false;

        if (validPaths.length !== 0) {
            isAchievable = true;
        }

        return isAchievable;
    }

    checkPaths(dictionary: Dictionary, paths: any[]): number[] {
        let validPaths: number[] = [];

        // check each path for achievability
        for (let path of paths) {
            let isValid: boolean = this.checkPath(dictionary, path);
            isValid ? validPaths.push(path) : "";
        }
        return validPaths;
    }

    checkPath(dictionary: Dictionary, path: number[]): boolean {
        let isValid = true;
        let literals: any[] = []; // list of variables or its negation
        
        // find for each literal its negation
        for (let id of path) {
            let node = dictionary.getSpecificMapEntry(id, "formula").toString();
            if (isLiteral(node)) {
                // check for literal if its negation was in path
                let negatedLiteral = negateLiteral(node);
                let includesNegation = literals.includes(negatedLiteral);
                if (includesNegation) {
                    isValid = false;
                }
                literals.push(node);
            }
        }
        return isValid;
    }

    getBranches(dictionary: Dictionary) {
        let paths = [];
        let ids = dictionary.getKeys();
        console.log("Ids:", ids);

        // Pfade erstellen
        paths = this.createPaths(ids);

        console.log("paths-created", paths);
        return paths;
    }

    createPaths(listOfIds: number[]): number[][] {
        let paths = [];
        let alreadyUsed: any[] = [];

        while (listOfIds.length !== 0) {
            let id = listOfIds.pop(); // last element

            if (alreadyUsed.includes(id)) {
                // wenn id bereits verwendet wurde erzeuge keinen branch
                continue;
            } else {
                // create branch
                let branch: number[] = [];

                for (let i of listOfIds) {
                    // integer
                    if (i % 1 === 0) {
                        branch.push(i);
                        alreadyUsed.push(i);
                    } else {
                        if (id !== undefined) {
                            // float
                            let idArr = id.toString().split('.');
                            let idFloat = idArr[1];
                            let iArr = i.toString().split('.');
                            let iFloat = iArr[1];
                            // when floats equals in fractional digits, append
                            let isChild = true;
                            for (let j = 0; j < iFloat.length; j++) {
                                if (iFloat[j] !== idFloat[j]) {
                                    isChild = false;
                                }
                            }
                            if (isChild) {
                                branch.push(i);
                                alreadyUsed.push(i);
                            }
                        }
                    }
                }
                if (id !== undefined) {
                    branch.push(id);
                    paths.push(branch);
                }
            }
        }
        return paths;
    }
}
