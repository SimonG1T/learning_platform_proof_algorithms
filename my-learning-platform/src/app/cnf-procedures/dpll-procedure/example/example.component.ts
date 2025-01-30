import { Component, Renderer2, ViewChild, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { DpllProcedureEvaluation } from '../generator/procedure-evaluation-example';
import { CustomMap } from '../generator/custom-map';

import { provideRenderer, showExplanation } from './explanation';
import { InputValidation } from '../../generator/input-validation';
import { SetTranslator } from '../../generator/set-translator';
import { TreeCreator } from '../generator/tree-creator';
import { LatexParagraphComponent } from '../../../latex/latex-paragraph/latex-paragraph.component';

/**
 * This class is the component for the example of the dpll procedure
 */
@Component({
    selector: 'app-dpll-example',
    templateUrl: './example.component.html',
    styleUrls: ['../../table-structure/table-structure.component.css', './example.component.css']
})
export class DpllExampleComponent {
    readonly slForm = viewChild<NgForm>('f');
    @ViewChild('latexParagraph') paragraphComponent!: LatexParagraphComponent;

    isLast = false;
    isEnd = false;
    satisfiable: any[] = [];

    // check if last was boolean
    wasBoolean: boolean = false;
    // Map for the storage of (id: from-id, applied-literal, formula)
    private customMap = new CustomMap();

    private instanceOfInputValidator = new InputValidation;
    private instanceOfSetTranslator = new SetTranslator;
    private instanceOfEvaluator: DpllProcedureEvaluation = new DpllProcedureEvaluation(this.customMap, this.renderer);
    private instanceOfTreeCreator: TreeCreator = new TreeCreator(this.renderer);

    name: string = "Beispiel für das Davis-Putnam-(Logeman-Loveland)-Verfahren";

    // id of tree-container
    treeId = '#dpll-tree';

    // Formulas as example
    formula = "";
    formula2 = "";
    example1 = "(A|B|C) & (!B|C) & (A|!C)";
    example2 = "(!A|B|!C) & (!A|B|D) & (A|B) & (B|C) & (B|!D)";

    constructor(private renderer: Renderer2) {}

    ngOnInit(): void {
        provideRenderer(this.renderer);
        this.formula = this.example1;
        this.formula2 = this.example2;
    }

    updateParagraph() {
        // Reset before switch
        this.reset();
        showExplanation("", undefined);

        // Switch to other example
        [this.formula, this.formula2] = [this.formula2, this.formula];

        // Render latex paragraph
        this.paragraphComponent.rerenderParagraph(this.formula);
    }

    // Next was clicked
    onNext() {
        // let the explanation appear for each applied literal
        // let the tree appear sequential
        
        // Remove the previous click-highlights
        this.instanceOfTreeCreator.removeClass('click');

        if (this.isLast) {
            this.reset();
            return;
        }

        if (this.isEnd) {
            // show satisfiable
            console.log("end:", this.satisfiable);
            this.isLast = true;
            let satisfaction = false;
            if (this.satisfiable.includes(true)) {
                satisfaction = true;
            }
            showExplanation('check', satisfaction, null);
            return;
        }

        let fromId = -1;
        let id = 0;
        let literal = '';
        let mySet: Set<string[]> = new Set;

        // get initial set
        if (this.customMap.getSize() === 0) {
            let valid = this.isInputValid(this.formula);
            if (valid) {
                // Translate into quantity notation
                mySet = this.instanceOfSetTranslator.translateToSet(this.formula);

                // set attributes
                this.instanceOfEvaluator.setAttributes(id,fromId,literal,mySet);
            }
        }

        // apply the procedure
        let result = this.instanceOfEvaluator.applyProcedure(this.wasBoolean);
        this.wasBoolean = false;
        console.log("result:", result, this.instanceOfEvaluator.getUnused());

        // is branch finished
        if (typeof result === 'boolean') {
            this.wasBoolean = true;
            this.satisfiable.push(result);

            // is unused empty
            let unused = this.instanceOfEvaluator.getUnused();
            if (unused.length === 0) {
                this.isEnd = true;

            } else {
                // reset values
                this.instanceOfEvaluator.resetOnNext();
                // get next
                this.getNext();
            }
        }
    }

    getNext() {
        // get the next literal from the unused ones
        let next = this.instanceOfEvaluator.popUnused();
        let [id,fromId,literal] = next;
        let myArray = this.customMap.getSpecificFormula(fromId);
        let mySet = new Set(myArray);
        this.instanceOfEvaluator.setAttributes(id,fromId,literal,mySet);
    }

    reset() {
        // clean up container
        let container = document.querySelector(this.treeId);
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }

        showExplanation("", undefined);

        // clear values
        this.instanceOfEvaluator.reset();
        this.customMap.clear();

        // reset values
        this.isLast = false;
        this.isEnd = false;
        this.wasBoolean = false;
        // this.unused = [];
        this.satisfiable = [];
    }

    // Check if input was in cnf
    isInputValid(input: string): boolean {
        const isValid = this.instanceOfInputValidator.isValidKNF(input);
        if (isValid) {
            return true;
        } else {
            return false;
        }
    }
}
