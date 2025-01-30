import { Component, Renderer2, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Dictionary } from '../value-type-full';
import { EvaluateResolutionProcedure } from '../procedure-evaluation-exercise';
import { InputValidation } from '../../generator/input-validation';
import { SetTranslator } from '../../generator/set-translator';
import { FeedbackService } from '../../../feedback/feedback.service';


/**
 * This class is the component for the exercise of the resolution procedure
 */
@Component({
    selector: 'app-resolution-exercise',
    templateUrl: './resolution-exercise.component.html',
    styleUrls: ['./resolution-exercise.component.css', '../../table-structure/table-structure.component.css']
})
export class ResolutionExerciseComponent {
    readonly slForm = viewChild<NgForm>('f');
    editMode = true;
    private customMap = new Dictionary();

    private instanceOfEvaluator: EvaluateResolutionProcedure = new EvaluateResolutionProcedure(this.renderer, this.customMap, this.feedbackService);
    private instanceOfInputValidator: InputValidation = new InputValidation();
    private instanceOfSetTranslator: SetTranslator = new SetTranslator();

    constructor(private feedbackService: FeedbackService, private renderer: Renderer2) {}

    ngOnInit(): void {        
        // Clear feedback on load
        this.feedbackService.updateFeedback('Feedback-Container');
    }

    // Update the procedure with the input
    onSubmit(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        this.handleUpdate(formula, form);
    }

    // Apply procedure
    onAddChild(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        if (this.customMap.getSize() === 0) {
            console.log("This should not be empty, please update");
        }
        
        if (this.editMode) {
            this.evaluateInput(formula);
        } else {
            console.log("not in edit mode - no input");
        }

        this.instanceOfEvaluator.setParent(0);
        this.instanceOfEvaluator.setParent(0);

        form.reset();
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

    // Update the procedure
    handleUpdate(formula: string, form: NgForm) {
        // Clean up container
        let container = document.querySelector('#resolution-full');
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }
        // reset
        this.instanceOfEvaluator.reset();

        if (this.editMode) {
            this.evaluateInput(formula);
        } else {
            console.log("not in edit mode - no input");
        }

        form.reset();
        // handle add button
        this.updateLabelVisibility();
    }

    evaluateInput(input: string) {
        // Input is valid and in knf
        const valid: boolean = this.isInputValid(input);
        let isFulfillable;

        if (valid) {
            let quantity;
            if (this.customMap.getSize() === 0) {
                // Translate into quantity notation
                quantity = this.instanceOfSetTranslator.translateToSet(input);

                // initial creation
                isFulfillable = this.instanceOfEvaluator.initialCreation(quantity);
            } else {
                // Translate into single-quantity notation
                quantity = this.instanceOfSetTranslator.translateSingle(input);

                isFulfillable = this.instanceOfEvaluator.resolute(quantity);
            }

            console.log("map:", this.customMap, isFulfillable);

            let isFinished = this.instanceOfEvaluator.isFinished();
            if (isFinished && isFulfillable === undefined) {
                isFulfillable = true;
            }

            if (isFulfillable !== undefined) {
                if (!isFulfillable) {
                    // contradiction: literal and its negation in nodes
                    let contradiction = this.instanceOfEvaluator.getContradiction();
                    this.feedbackService.finishedMessage(`Nach dem Resolutionsverfahren ist die Formel <b>nicht erfüllbar</b>,<br> sie enthält eine leere Klausel für res(${contradiction[1]},${contradiction[2]})!`);
                }
                if (isFulfillable) {
                    this.feedbackService.finishedMessage(`Nach dem Resolutionsverfahren ist die Formel <b>erfüllbar</b>,<br> es konnte keine leere Klausel erzeugt werden!`);
                }
            }
        }
    }

    // Is input in the cnf for update or set notation for adding child
    isInputValid(input: string): boolean {
        
        if (this.customMap.getSize() === 0) {
            const isValid = this.instanceOfInputValidator.isValidKNF(input);

            if (isValid) {
                this.feedbackService.updateFeedback('Input war in KNF!');
                return true;
            } else {
                this.feedbackService.errorMessage('Input war nicht in KNF!');
            }

        } else if (this.customMap.getSize() > 0) {
            const isValid = this.instanceOfInputValidator.isValidSingleQuantityNotation(input);

            if (isValid) {
                this.feedbackService.updateFeedback('Input war in Mengen-Schreibweise!');
                return true;
            } else {
                this.feedbackService.errorMessage('Input war nicht in Mengen-Schreibweise!');
            }
            return false;

        }
        return false;
    }

    // Handle visability of add button and lable
    updateLabelVisibility(): void {
        const label = document.getElementById('myChildLabel');
        const button = document.getElementById('myChildButton');

        if (label && button) {
            if (this.customMap.getSize() > 0) {
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
