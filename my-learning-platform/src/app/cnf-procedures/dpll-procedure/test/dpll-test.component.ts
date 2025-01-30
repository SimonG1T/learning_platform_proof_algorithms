import { Component, OnInit, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { InputValidation } from '../../generator/input-validation';
import { DpllProcedureEvaluation } from '../generator/procedure-evaluation-test';
import { SetTranslator } from '../../generator/set-translator';
import { CustomMap } from '../generator/custom-map';
import { FeedbackService } from '../../../feedback/feedback.service';
import { CNFTranslator } from '../../generator/knf-translator';


/**
 * Class for the component of test of dpll procedure
 */
@Component({
    selector: 'app-dpll-test',
    templateUrl: './dpll-test.component.html',
    styleUrls: ['../../table-structure/table-structure.component.css']
})
export class DpllTestComponent implements OnInit {
    editMode = true;

    private customMap = new CustomMap();
    private instanceOfInputValidator: InputValidation = new InputValidation();
    private instanceOfSetTranslator: SetTranslator = new SetTranslator();
    private instanceOfCNFTranslator: CNFTranslator = new CNFTranslator();
    private instanceOfDpllEvaluator: DpllProcedureEvaluation = new DpllProcedureEvaluation(this.customMap, this.renderer);

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

    // Translate the formula to cnf
    onTranslate(form: NgForm): string {
        const value = form.value;
        const formula = value.formula;

        // clean up container
        let container = document.querySelector('#dpll-tree');
        if (container !== null) {

            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }

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

    // Update on link
    onLink(event: { target: any; srcElement: any; currentTarget: any; }, form: NgForm) {
        var target = event.target || event.srcElement || event.currentTarget;
        var idAttr = target.attributes.id;
        var linkId = idAttr.nodeValue;
        var linkContext = target.textContent;

        // handle cnf link
        if (linkId.includes('c')) {
            // Update the input to the cnf
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

    // Update the procedure
    handleUpdate(formula: string, form: NgForm) {
        // Clean up container
        let container = document.querySelector('#dpll-tree');
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }

        if (this.editMode) {
            this.evaluateInput(formula);
        } else {
            console.log("not in edit mode - no input")
        }

        form.reset();
    }

    // Handle input and call procedure
    evaluateInput(input: string) {

        // Input is valid and in cnf
        const valid: boolean = this.isInputValid(input);

        if (valid) {
            // Translate into quantity notation
            let quantity = this.instanceOfSetTranslator.translateToSet(input);
            console.log("formel nach translate", quantity);

            // Make sure map is empty
            this.instanceOfDpllEvaluator.reset();

            // Create the DPLL
            let satisfiable = this.instanceOfDpllEvaluator.reduce(quantity);

            // Feedback for the satisfaction
            if (satisfiable) {
                this.feedbackService.finishedMessage('Nach dem DPLL-Verfahren ist die Formel <b>erfüllbar</b>, <br> sie enthält mindestens eine Variante, <br>worin keine leere Klausel enthalten ist!');
            } else {
                this.feedbackService.finishedMessage('Nach dem DPLL-Verfahren ist die Formel <b>nicht erfüllbar</b>, <br> sie enthält nur Varianten, welche leere Klauseln enthalten!');
            }
        }
    }

    // Check if input is in correct form
    isInputValid(input: string): boolean {
        console.log("Input:", input);
        const isValid = this.instanceOfInputValidator.isValidKNF(input);
        if (isValid) {
            this.feedbackService.updateFeedback('Input ist in KNF!');
            return true;
        } else {
            this.feedbackService.errorMessage('Input ist nicht in KNF!');
        }
        return false;
    }
}
