import { Component, Renderer2, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Dictionary } from '../value-type-full';
import { EvaluateResolutionProcedure } from '../procedure-evaluation';
import { InputValidation } from '../../generator/input-validation';
import { SetTranslator } from '../../generator/set-translator';
import { FeedbackService } from '../../../feedback/feedback.service';
import { CNFTranslator } from '../../generator/knf-translator';


/**
 * This class is the component for the test of the resolution procedure
 */
@Component({
    selector: 'app-resolution-test',
    templateUrl: './resolution-test.component.html',
    styleUrls: ['./resolution-test.component.css', '../../table-structure/table-structure.component.css']
})
export class ResolutionTestComponent {
    readonly slForm = viewChild<NgForm>('f');
    editMode = true;
    private customMap = new Dictionary();

    private instanceOfEvaluator: EvaluateResolutionProcedure = new EvaluateResolutionProcedure(this.renderer, this.customMap, 'test');
    private instanceOfInputValidator: InputValidation = new InputValidation();
    private instanceOfSetTranslator: SetTranslator = new SetTranslator();
    private instanceOfCNFTranslator: CNFTranslator = new CNFTranslator();

    constructor(private feedbackService: FeedbackService, private renderer: Renderer2) {}

    ngOnInit(): void {
        // Clear feedback on load
        this.feedbackService.updateFeedback('Feedback-Container');
    }

    // Update the procedure with input
    onSubmit(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        this.handleUpdate(formula, form);
    }

    // Translate the formula to cnf
    onTranslate(form: NgForm): string {
        const value = form.value;
        const formula = value.formula;

        // clean up container
        let container = document.querySelector('#resolution-full');
        if (container !== null) {

            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }
        // Clear feedback on load
        this.feedbackService.updateFeedback('Feedback-Container');

        if (this.editMode) {

            let valid = this.isInputValid(formula);
            if (valid) {
                // Update the input to the cnf
                form.controls['formula']?.setValue(formula);
                return formula;
            }

            let knf = this.instanceOfCNFTranslator.translateToCNF(formula);

            // not in cnf, inequal parentheses
            if (typeof knf === "boolean") {
                this.feedbackService.errorMessage('Input konnte nicht in KNF umgewandelt werden!');
                return formula;
            } else {
                // checks if the input is valid and in knf
                const valid: boolean = this.isInputValid(knf);

                // Feedback for translation
                if (valid) {
                    this.feedbackService.updateFeedback(`Eingabe: ${formula},<br>wurde in KNF: ${knf} umgewandelt.`);

                    // Update the input to the cnf
                    form.controls['formula']?.setValue(knf);
                    return knf;
                } else {
                    this.feedbackService.doubleMessage(`Eingabe: ${formula},<br>wurde in: ${knf} umgewandelt.`);
                }
            }
        } else {
            console.log("not in edit mode - no input")
        }
        return '';
    }

    // Update the procedure with link
    onLink(event: { target: any; srcElement: any; currentTarget: any; }, form: NgForm) {
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var linkId = idAttr.nodeValue;
        var linkContext = target.textContent;

        // handle cnf link
        if (linkId.includes('c')) {
            // Update the inputs to the cnf
            form.controls['formula']?.setValue(linkContext);
            linkContext = this.onTranslate(form);
        }

        this.handleUpdate(linkContext, form);
    }

    // Empty the input field
    onClear(form: NgForm) {
        // Clear input
        form.resetForm();
    }

    // Update the proceduer
    handleUpdate(formula: string, form: NgForm) {
        // Clean up container
        let container = document.querySelector('#resolution-full');
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }
        // Clear feedback on load
        this.feedbackService.updateFeedback('');

        if (this.editMode) {
            this.evaluateInput(formula);
        } else {
            console.log("not in edit mode - no input");
        }

        form.reset();
    }

    // Handle input and apply procedure
    evaluateInput(input: string) {
        // Input is valid and in knf
        const valid: boolean = this.isInputValid(input);

        if (valid) {
            // Translate into quantity notation
            let quantity = this.instanceOfSetTranslator.translateToSet(input);

            let isFulfillable;

            // reset the values of the resolution
            this.instanceOfEvaluator.reset();

            // full resolution
            isFulfillable = this.instanceOfEvaluator.createFullResolution(quantity);

            if (isFulfillable === undefined) {
                isFulfillable = true;
                this.feedbackService.finishedMessage(`Das Resolutionsverfahren wurde nicht angewendet!`);
                return;
            }

            let dictionary = this.instanceOfEvaluator.getDictionary();

            // attributes: result, quantity, redList, greenList
            let attributes = this.instanceOfEvaluator.getResultMap(isFulfillable);

            // contradiction: literal and its negation in nodes
            let contradiction = this.instanceOfEvaluator.getContradiction();

            if (!isFulfillable) {
                console.log("contradiction:", contradiction);
                this.feedbackService.finishedMessage(`Nach dem Resolutionsverfahren ist die Formel <b>nicht erfüllbar</b>,<br> sie enthält eine leere Klausel für res(${contradiction[1]},${contradiction[2]})!`);
            } else {
                this.feedbackService.finishedMessage(`Nach dem Resolutionsverfahren ist die Formel <b>erfüllbar</b>,<br> es konnte keine leere Klausel erzeugt werden!`);
            }
        }
    }

    isInputValid(input: string): boolean {
        const isValid = this.instanceOfInputValidator.isValidKNF(input);
        if (isValid) {
            this.feedbackService.doubleMessage('Input war in KNF!');
            return true;
        } else {
            this.feedbackService.errorMessage('Input war nicht in KNF!');
        }
        return false;
    }
}
