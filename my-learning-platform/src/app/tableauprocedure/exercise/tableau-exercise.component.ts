import { Component, OnInit, Renderer2, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TableauInputValidation } from '../generator/tableau-input-validation';
import { TableauProcedureEvaluation } from '../generator/exercise-generator/tableau-procedure-evaluation';
import { Dictionary } from '../generator/value-type';
import { FeedbackService } from '../../feedback/feedback.service';
import { removeOuterParenthesis } from '../../procedure-functions';


/**
 * Class for the component of the exercise for the tableau procedure
 */
@Component({
    selector: 'app-tableau-exercise',
    templateUrl: './tableau-exercise.component.html',
    styleUrl: '../my-tree/table-structure/table-structure.component.css'
})
export class TableauExerciseComponent implements OnInit {
    readonly slForm = viewChild<NgForm>('f');
    editMode = true;

    name: string = "Übung für das Tableauverfahren";

    private instanceOfInputValidator: TableauInputValidation = new TableauInputValidation();

    // step by step creation for exercise
    private instanceOfTableauEvaluator: TableauProcedureEvaluation = new TableauProcedureEvaluation(this.customDictionary, this.renderer, this.feedbackService);

    constructor(private customDictionary: Dictionary, private feedbackService: FeedbackService, private renderer: Renderer2) {}

    ngOnInit(): void {
        // clear feedback on load
        this.feedbackService.updateFeedback('Feedback-Container');
    }

    onSubmit(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        this.handleUpdate(formula, form);
    }

    onLink(event: { target: any; srcElement: any; currentTarget: any; }, form: NgForm) {
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var linkId = idAttr.nodeValue;
        var linkContext = target.textContent;
        console.log("link-id:", linkId, linkContext);

        this.handleUpdate(linkContext, form);
    }

    onClear(form: NgForm) {
        form.resetForm();
    }

    onAddChild(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        console.log("input for add:", formula);

        if (this.customDictionary.size() === 0) {
            console.log("This should not be empty, please update");
        }

        let parentId = this.instanceOfTableauEvaluator.getParentId();
        this.evaluateInput(formula, parentId);

        form.reset();
    }

    handleUpdate(formula: string, form: NgForm) {
        // clean up tree-container
        let container = document.querySelector('#tableau-tree');
        if (container !== null) {

            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }

        // empty the map and reset values
        this.instanceOfTableauEvaluator.reset();     

        if (this.editMode) {
            this.evaluateInput(formula, -1);
        } else {
            console.log("not in edit mode - no input")
        }

        // clear input
        form.reset();
        // handle add button
        this.updateLabelVisibility();
    }

    evaluateInput(input: string, parentId: number) {

        // checks if the input is valid
        const valid: boolean = this.isInputValid(input);
        console.log("Is input valid", valid, input);

        if (valid) {

            // Remove outer parenthesis
            let formula = removeOuterParenthesis(input);

            // create the tableau
            // Tableau-Attributes: paths, valid-paths, dictionary, tableau-achievable
            this.instanceOfTableauEvaluator.createTableau(formula, parentId);
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

    updateLabelVisibility(): void {
        const label = document.getElementById('myChildLabel');
        const button = document.getElementById('myChildButton');

        if (label && button) {
            if (this.customDictionary.size() > 0) {
                // show label and button
                label.style.display = "block";
                button.style.display = "block";
            } else {
                // hide label and button
                label.style.display = "none";
                button.style.display = "none";
            }
        }
    }
}
