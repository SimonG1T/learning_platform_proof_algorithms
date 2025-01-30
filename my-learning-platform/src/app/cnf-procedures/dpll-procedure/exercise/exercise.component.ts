import { Component, OnInit, Renderer2, viewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { InputValidation } from '../../generator/input-validation';
import { DpllProcedureEvaluationExercise } from '../generator/procedure-evaluation-exercise';
import { SetTranslator } from '../../generator/set-translator';
import { CustomMap } from '../generator/custom-map';
import { TreeCreator } from '../generator/tree-creator';
import { FeedbackService } from '../../../feedback/feedback.service';


/**
 * This class is the component for the exercise of the dpll procedure
 */
@Component({
    selector: 'app-dpll-exercise-component',
    templateUrl: './exercise.component.html',
    styleUrls: ['../../table-structure/table-structure.component.css']
})
export class DpllExerciseComponent implements OnInit {
    readonly slForm = viewChild<NgForm>('f');
    editMode = true;

    // List for the satisfaction
    private satisfiable: boolean[] = [];
    // Dictionary for the whole tree
    private customMap = new CustomMap();

    private instanceOfInputValidator: InputValidation = new InputValidation();
    private instanceOfSetTranslator: SetTranslator = new SetTranslator();
    private instanceOfTreeCreator: TreeCreator = new TreeCreator(this.renderer);

    // step by step createion for exercise
    private instanceOfDpllEvaluator: DpllProcedureEvaluationExercise = new DpllProcedureEvaluationExercise(this.customMap, this.renderer, this.feedbackService);

    constructor(private feedbackService: FeedbackService, private renderer: Renderer2) {}

    ngOnInit(): void {
        // clear feedback on load
        this.feedbackService.updateFeedback('Feedback-Container');
    }

    // Update the map with input
    onSubmit(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        this.handleUpdate(formula, form);
    }

    // Update the map with link
    onLink(event: { target: any; srcElement: any; currentTarget: any; }, form: NgForm) {
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var linkId = idAttr.nodeValue;
        var linkContext = target.textContent;
        console.log("link-id:", linkId, linkContext);

        this.handleUpdate(linkContext, form);
    }

    // Clear the input field
    onClear(form: NgForm) {
        form.resetForm();
    }

    // Add child with input
    onAddChild(form: NgForm) {
        const value = form.value;
        const formula = value.formula;

        if (this.customMap.getSize() === 0) {
            console.log("This should not be empty, please update");
        }

        this.evaluateInput(formula);

        form.reset();
    }

    // Update the procedure
    handleUpdate(formula: string, form: NgForm) {

        // clean up container
        let container = document.querySelector('#dpll-tree');
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }

        // make sure map is empty
        this.customMap.clear();
        // reset values
        this.satisfiable = [];
        this.instanceOfDpllEvaluator.reset();

        if (this.editMode) {
            this.evaluateInput(formula);
        } else {
            console.log("not in edit mode - no input");
        }

        form.reset();

        this.updateLabelVisibility();
    }

    // Update the visibility of the add button and label
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

    // Call the procedure for the current step
    evaluateInput(input: string) {

        // checks if input is valid
        // and in cnf for update
        // and in set notation for add child
        const valid: boolean = this.isInputValid(input);
        let quantity:Set<string[]> = new Set<string[]>;

        if (valid) {
            if (this.customMap.getSize() === 0) {
                // translate cnf into quantity notation
                quantity = this.instanceOfSetTranslator.translateToSet(input);
            } else {
                // translate set notation {} into quantity array notation
                if (input === '{}') {
                    quantity = new Set;
                } else {
                    quantity = this.instanceOfSetTranslator.translateToArraySet(input);
                }
            }

            let result = this.instanceOfDpllEvaluator.reduce(quantity);
            console.log("result:", result);

            // Check if the procedure is done
            let unfinished = this.instanceOfDpllEvaluator.getUnfinished();
            let unused = this.instanceOfDpllEvaluator.getUnused();
            if (unfinished.length !== 0) {
                this.feedbackService.doubleMessage(`<br>Es gibt noch Ids, welche nicht zu einem Ergebnis führen:<br>${unfinished.join(',')}`);
            }
            if (unused.length !== 0) {
                let unused = this.instanceOfDpllEvaluator.formatUnused();
                this.feedbackService.doubleMessage(`<br>Es gibt noch Komplemente zu verwendeten Literalen von einem parent, die noch nicht verwendet wurden:<br>${unused.join(',')}`);
            }

            if (typeof result === 'boolean') {
                this.satisfiable.push(result);

                // Node was checked
                if (result) {
                    this.feedbackService.doubleMessage(`<br>Die aktuelle Formel ist erfüllbar.<br>Sie führt zu einer leeren Menge.`);
                } else {
                    // Procedure is done
                    if (unfinished.length === 0 && unused.length) {

                        if (!this.satisfiable.includes(true)) {
                            this.feedbackService.doubleMessage(`<br>Nach dem DPLL-Verfahren ist die Formel nicht erfüllbar.<br>Sie führt nur zu Mengen, welche die leere Menge enthalten!`);
                        }
                    } else {
                        this.feedbackService.doubleMessage(`<br>Die aktuelle Formel ist nicht erfüllbar.<br>Sie führt zu einer Menge, welche die leere Menge enthält.`);
                    }
                }
            }

            // Is satisfiable
            if (this.satisfiable.includes(true)) {
                this.feedbackService.doubleMessage(`<br>Nach dem DPLL-Verfahren ist die Formel erfüllbar.<br>Sie führt mindestens zu einer leeren Menge!`);
            }

            this.instanceOfTreeCreator.removeClass('click');
            console.log("Map:", this.customMap);
        }
    }

    // Checks if input was the right form
    isInputValid(input: string): boolean {
        console.log("Input:", input);
        if (this.customMap.getSize() === 0) {
            const isValid = this.instanceOfInputValidator.isValidKNF(input);
            if (isValid) {
                this.feedbackService.updateFeedback('Input war in KNF');
                return true;
            } else {
                // console.log("not in KNF");
                this.feedbackService.errorMessage('Input war nicht in KNF!');
            }
            return false;
        } else if (this.customMap.getSize() > 0) {
            const isValid = this.instanceOfInputValidator.isValidQuantityNotation(input);
            if (isValid || input === '{{}}') {
                this.feedbackService.updateFeedback('Input war in Mengen-Schreibweise!');
                return true;
            } else {
                this.feedbackService.errorMessage('Input war nicht in Mengen-Schreibweise!');
            }
            return false;
        }
        return false;
    }
}
