import { Component, Renderer2, ViewChild, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Dictionary } from '../value-type-full';

import { showExplanation, changeNewCreated } from './explanation';
import { EvaluateResolutionProcedure } from '../procedure-evaluation';
import { InputValidation } from '../../generator/input-validation';
import { FeedbackService } from '../../../feedback/feedback.service';
import { SetTranslator } from '../../generator/set-translator';
import { LatexParagraphComponent } from '../../../latex/latex-paragraph/latex-paragraph.component';


/**
 * Class for the component of the example for the resolution procedure
 */
@Component({
    selector: 'app-resolution-example',
    templateUrl: './resolution-example.component.html',
    styleUrls: ['../../table-structure/table-structure.component.css', './resolution-example.component.css']
})
export class ResolutionExampleComponent {
    readonly slForm = viewChild<NgForm>('f');
    @ViewChild('latexParagraph') paragraphComponent!: LatexParagraphComponent;

    isLast = false;
    isEnd = false;

    private customMap = new Dictionary();

    private feedbackService = new FeedbackService;
    private instanceOfInputValidator = new InputValidation;
    private instanceOfSetTranslator = new SetTranslator;
    private instanceOfProcedureEvaluation = new EvaluateResolutionProcedure(this.renderer, this.customMap, 'example');

    name: string = "Beispiel für das Resolutionsverfahren";

    // id of tree-container
    treeId = '#resolution-full'

    // Formulas as example
    formula = "";
    formula2 = "";
    example1 = "(A) & (!B) & (!A|B|C) & (!A|!C)"; // Unerfüllbar
    example2 = "(A|B) & (!A|B) & (A|!B)";       // Unerfüllbar
    example3 = "(!A|B|!C) & (!A|B|D) & (A|B) & (B|C) & (B|!D)"; // Erfüllbar
    example4 = "(!A|B|!C) & (!A|B|D) & (A|B) & (B|C) & (B|!D) & (!B)"; // Unerfüllbar
    quantity: Set<string[]> = new Set;

    achievable: boolean | undefined = undefined;
    complement: string[] = [];
    
    // next ids
    i = 0;      // 1 - origin_i
    j = 0;      // new[0] - end_j
    beg_j = 0;
    end_i = -1; // length-1
    end_j = -1; // length

    // used second parent ids for the current first parent id
    wasUsed = 0;

    constructor(private renderer: Renderer2) {}

    ngOnInit(): void {
        this.formula = this.example1;
        this.formula2 = this.example3;
    }

    updateParagraph() {
        // Reset before switch
        this.reset();
        showExplanation('', this.customMap);

        // Switch to other example
        [this.formula, this.formula2] = [this.formula2, this.formula];

        // Render latex paragraph
        this.paragraphComponent.rerenderParagraph(this.formula);
    }

    onNext() {
        console.log("next:", this.achievable, this.i, this.j, this.isEnd, this.isLast);
        // reset parent-ids
        this.instanceOfProcedureEvaluation.setParent(0);
        this.instanceOfProcedureEvaluation.setParent(0, true);

        if (this.isEnd) {
            // Show achievability
            if (!this.achievable) {
                this.instanceOfProcedureEvaluation.setParent(this.customMap.getSize()-1);
            }
            showExplanation(this.achievable, this.customMap, [], this.complement);
            this.isLast = true;
            this.isEnd = false;
            return;
        }
        if (this.isLast) {
            // Reset for rerun
            this.reset();
            showExplanation('', this.customMap);
            return;
        }

        let mapSize = this.customMap.getSize();

        if (mapSize === 0) {
            // Input is valid and in cnf
            const valid: boolean = this.isInputValid(this.formula);
    
            if (valid) {
                // Translate into quantity notation
                this.quantity = this.instanceOfSetTranslator.translateToSet(this.formula);

                this.i = 1;  // start at 1
                this.j = -1; // root: 0, initial-creator: 1
                this.beg_j = -1;
                this.end_i = this.quantity.size-1;
                this.end_j = this.quantity.size;
            }
        }

        this.handleParentIds();

        this.achievable = this.instanceOfProcedureEvaluation.createFullResolution(this.quantity);

        if (typeof this.achievable === 'boolean') {
            this.instanceOfProcedureEvaluation.setParent(0);
            this.instanceOfProcedureEvaluation.setParent(0, true);
        }

        this.handleEnding();

        let wasNew = this.instanceOfProcedureEvaluation.getNewWasCreated();

        showExplanation('', this.customMap, [this.i,this.j], [], wasNew);
    }

    reset() {

        // clean up container
        let container = document.querySelector(this.treeId);
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }
        changeNewCreated([]);

        // clear values
        this.instanceOfProcedureEvaluation.reset();

        // reset values
        this.achievable = undefined;
        this.complement = [];
        this.wasUsed = 0;
        this.isEnd = false;
        this.isLast = false;
    }

    // Get the next parent ids res(i,j)
    handleParentIds() {
        // For each round:
        //  If new-ones were created
        //  For each i use all j+1
        if (this.j < this.end_j) {
            this.j++;
        } else if (this.j === this.end_j) {

            // end j
            if (this.i === this.end_i) {
                // end of i
                this.wasUsed = this.end_j;
                this.i = 1;
                this.end_i = this.customMap.getSize()-2;
                let newOnes = this.instanceOfProcedureEvaluation.getNewCreated(); // new ones are indices
                console.log("new-ones:", newOnes);
                this.j = newOnes[0]+1;
                this.beg_j = newOnes[0]+1;
                this.end_j = newOnes[newOnes.length-1]+1;
                this.instanceOfProcedureEvaluation.resetNewCreated();

                if (newOnes.length !== 0) {
                    changeNewCreated(newOnes, true);
                } else {
                    changeNewCreated(newOnes);
                }
            } else {
                this.i++;
                this.j = Math.max(this.i+1, this.beg_j);
            }
        }
        this.instanceOfProcedureEvaluation.setParent(this.i);
        this.instanceOfProcedureEvaluation.setParent(this.j,true);
    }

    // Handle ending of each round
    handleEnding() {
        let seriesFinished = this.isSeriesFinished();
        let newCreated = this.instanceOfProcedureEvaluation.getNewCreated();

        if (seriesFinished && newCreated.length === 0 && this.i === this.end_i && this.j === this.end_j) {
            // no new were created and the right amount was used
            changeNewCreated([], false);
            this.isEnd = true;
            this.achievable = true;
        }

        if (this.achievable === false) {
            // not achievable, empty clause could be created
            changeNewCreated([]);
            this.isEnd = true;

            if (this.achievable === false) {
                let contradiction = this.instanceOfProcedureEvaluation.getContradiction();
                if (contradiction.length !== 0) {
                    this.complement = [contradiction[0]];
                    this.i = contradiction[1];
                    this.j = contradiction[2];
                    this.instanceOfProcedureEvaluation.setParent(this.i, false, true);
                    this.instanceOfProcedureEvaluation.setParent(this.j, true, true);
                }
            }
        }
    }

    // Check if input was in cnf
    isInputValid(input: string): boolean {
        const isValid = this.instanceOfInputValidator.isValidKNF(input);
        if (isValid) {
            this.feedbackService.updateFeedback('Input war in KNF!');
            return true;
        } else {
            this.feedbackService.errorMessage('Input war nicht in KNF!');
        }
        return false;
    }

    // Check if the number of all ids is the right amount: each i was used on all j+1
    isSeriesFinished(): boolean {
        // (n * (n+1)) / 2
        let n = this.wasUsed;
        let result = (n * (n+1)) / 2;
        let gRList = this.instanceOfProcedureEvaluation.getGRLists();
        let listsSize = gRList[0].length + gRList[1].length;

        if (result === listsSize) {
            return true;
        }
        return false;
    }
}
