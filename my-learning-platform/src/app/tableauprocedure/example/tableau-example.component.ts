import { Component, OnInit, Renderer2, ViewChild, viewChild } from '@angular/core';
import { TableStructureComponent } from '../my-tree/table-structure/table-structure.component';
import { Dictionary } from '../generator/value-type';

import { provideRenderer, showExplanation, changeExplanation } from './explanation';
import { NgForm } from '@angular/forms';
import { TableauProcedureEvaluation } from '../generator/example-test-generator/tableau-procedure-creation';
import { FeedbackService } from '../../feedback/feedback.service';
import { LatexParagraphComponent } from '../../latex/latex-paragraph/latex-paragraph.component';


/**
 * class for the component of the example for the tableau procedure
 */
@Component({
    selector: 'app-tableau-example',
    templateUrl: './tableau-example.component.html',
    styleUrls: ['../my-tree/table-structure/table-structure.component.css', './tableau-example.component.css']
})
export class TableauExampleComponent implements OnInit {
    readonly slForm = viewChild<NgForm>('f');
    @ViewChild('latexParagraph') paragraphComponent!: LatexParagraphComponent;

    iterator: number = 0;
    isLast = false;
    isEnd = false;
    private customMap = new Dictionary();

    private instanceOfEvaluator: TableauProcedureEvaluation = new TableauProcedureEvaluation(this.customMap, this.feedbackService, this.renderer);

    name: string = "Beispiel für das Tableauverfahren";

    formula = "";
    formula2 = "";
    example1: string = "!((!(A | B)) | A)";
    example2: string = "!((A -> B) & A)";

    // rules
    rule1: string = "$\\lnot\\lnot{H} \\above{2pt} H$";
    rule2: string = "$G_1\\land{G_2} \\above{2pt} {{G_1} \\atop {G_2}}$";
    rule3: string = "$\\lnot({G_1}\\land{G_2}) \\above{2pt} \\lnot{G_1} | \\lnot{G_2}$";
    rule4: string = "${G_1}\\lor{G_2} \\above{2pt} {G_1} | {G_2}$";
    rule5: string = "$\\lnot({G_1}\\lor{G_2}) \\above{2pt} {\\lnot{G_1} \\atop \\lnot{G_2}}$";
    rule6: string = "${G_1}\\rightarrow{G_2} \\above{2pt} {\\lnot{G_1} \\lor {G_2}}$";
    rule7: string = "${G_1}\\leftrightarrow{G_2} \\above{2pt} {(\\lnot{G_1} \\lor {G_2}) \\land (\\lnot{G_2} \\lor {G_1})}$";


    constructor(private feedbackService: FeedbackService, private renderer: Renderer2) {}

    ngOnInit(): void {
        provideRenderer(this.renderer);
        this.formula = this.example1;
        this.formula2 = this.example2;
    }

    updateParagraph() {
        // Reset before switch
        this.reset();
        showExplanation();

        // Switch to other example
        [this.formula, this.formula2] = [this.formula2, this.formula];

        // Render latex paragraph
        this.paragraphComponent.rerenderParagraph(this.formula);
    }

    onNext() {
        // let the explanation appear for each applied rule
        // let the tree appear sequential

        // remove highlights from parent
        this.instanceOfEvaluator.removeHighlight();

        if (this.isLast) {
            this.reset();
            return;
        }

        if (this.isEnd) {
            // create the results
            let [finished,achievable] = this.instanceOfEvaluator.createResults(this.iterator);
            this.iterator++;
            if (finished) {
                this.isLast = true;

                showExplanation(-1,-1,'', achievable, []);
            } else {
                showExplanation(-1,-1,'', achievable, [0]);
            }
            return;
        }

        // initial run
        if (this.customMap.size() === 0) {
            this.instanceOfEvaluator.reset();
        }

        let newId = this.instanceOfEvaluator.createExample(this.formula);

        // handle explanation
        // attributes: id: number|number[], rule: number, child: string|string[], parent: string|boolean, branch: number[]
        if (typeof newId === 'number') {
            if (newId === -1) {
                this.isEnd = true;
                this.iterator = 0;
                console.log("is finished");
                this.onNext(); // run first end
                return;
            }
            let entry = this.customMap.getMapEntry(newId);
            if (entry !== undefined) {
                let {fromId,rule,formula} = entry;
                let parent = this.customMap.getSpecificMapEntry(fromId,'formula').toString();
                console.log(newId,':', fromId, rule, formula);
                showExplanation(newId,rule,formula,parent);
            }
        } else {
            let first = newId[0];
            let second = newId[1];
            let appliedRule = -1;
            let childStr:string[] = [];
            let parent:string = "";
            
            let entry = this.customMap.getMapEntry(first);
            if (entry !== undefined) {
                let {fromId,rule,formula} = entry;
                console.log("first:", first,':', fromId, rule, formula);
                appliedRule = rule;
                childStr.push(formula);
                parent = this.customMap.getSpecificMapEntry(fromId,'formula').toString();
            }
            
            entry = this.customMap.getMapEntry(second);
            if (entry !== undefined) {
                let {fromId,rule,formula} = entry;
                console.log("second:", second,':', fromId, rule, formula);
                childStr.push(formula);
            }
            showExplanation(newId,appliedRule,childStr,parent);
        }
    }

    reset() {
        // clean up container
        let container = document.querySelector('#tableau-tree');
        if (container !== null) {
            while (container.hasChildNodes()) {
                this.renderer.removeChild(container, container.firstChild);
            }
        }

        // clear values
        this.instanceOfEvaluator.reset();
        showExplanation();

        // reset values
        this.iterator = 0;
        this.isLast = false;
        this.isEnd = false;
        this.customMap.clearMap();
    }
}
