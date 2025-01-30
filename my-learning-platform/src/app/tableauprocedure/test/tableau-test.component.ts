import { Component, OnInit, Renderer2, ElementRef, viewChild } from '@angular/core';

import { Dictionary } from '../generator/value-type';
import { TableauProcedureEvaluation } from '../generator/example-test-generator/tableau-procedure-creation';
import { TableauInputValidation } from '../generator/tableau-input-validation';
import { FeedbackService } from '../../feedback/feedback.service';
import { NgForm } from '@angular/forms';


/**
 * Class for component of test for tablau procedure
 */
@Component({
    selector: 'tableau-test',
    templateUrl: './tableau-test.component.html',
    styleUrl: '../my-tree/table-structure/table-structure.component.css'
})
export class TableauTestComponent implements OnInit {
    readonly slForm = viewChild<NgForm>('f');
    editMode = true;
    private customMap = new Dictionary();

    private instanceOfEvaluator: TableauProcedureEvaluation = new TableauProcedureEvaluation(this.customMap, this.feedbackService, this.renderer);
    private instanceOfInputValidator: TableauInputValidation = new TableauInputValidation();

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

    // Update the procedure with link
    onLink(event: { target: any; srcElement: any; currentTarget: any; }, form: NgForm) {
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var linkContext = target.textContent;

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
        let container = document.querySelector('#tableau-tree');
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }
        // reset values
        this.instanceOfEvaluator.reset();
        this.customMap.clearMap();

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

            // reset the values of the resolution
            this.instanceOfEvaluator.reset();
            this.customMap.clearMap();

            // create the tableau
            let attributes = this.instanceOfEvaluator.createTableau(input);
            console.log("attributes:", attributes);
        }
    }

    isInputValid(input: string): boolean {
        const isValid = this.instanceOfInputValidator.isValidTableauInput(input);
        if (isValid) {
            this.feedbackService.updateFeedback('Input war gültig!');
            return true;
        } else {
            this.feedbackService.errorMessage('Input war ungültig!');
        }
        return false;
    }
}
