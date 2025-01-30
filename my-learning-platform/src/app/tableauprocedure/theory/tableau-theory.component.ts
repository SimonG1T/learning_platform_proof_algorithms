import { Component, OnInit, Renderer2 } from "@angular/core";


/**
 * Class for component of the theory for the tableau procedure
 */
@Component({
    selector: 'app-tableau-theory',
    templateUrl: './tableau-theory.component.html',
    styleUrls: ['./tableau-theory.component.css']
})
export class TableauTheoryComponent implements OnInit {

    isLast = false;

    name = "Theorie des Tableauverfahrens";

    line1 = '{{A,B};{!A,C}}';
    line2 = '{B,C}';

    // quantors
    quantor_existenz: string = "$\\exists{A(x)}$";
    quantor_all: string = "$\\forall{A(x)}$";

    currentContent = '';
    private currentId = 0;
    private numberOfContents = 7;

    ngOnInit() {
        this.currentId = 1;
        this.currentContent = 'content1';
    }

    onSwitch() {
        
        this.currentId++;

        if (this.currentId === this.numberOfContents) {
            this.currentId = 1;

        }
        if (this.currentId === this.numberOfContents-1) {
            this.isLast = true;
        } else {
            this.isLast = false;
        }

        this.currentContent = 'content' + this.currentId.toString();
    }
}


/**
 * Class that provides the rules for the theory for the tableau procedure
 */
@Component({
    selector: 'app-tableau-rules',
    templateUrl: './tableau-rules.html',
    styleUrls: ['./tableau-theory.component.css']
})
export class TableauRulesComponent {
    // rules
    double_negation: string = "$\\lnot \\lnot {H} \\above{1pt} {H}$";

    conjunction: string = "${G_1} \\land {G_2} \\above{1pt} {{G_1} \\atop {G_2}}$";
    disjunction: string = "${G_1} \\lor {G_2} \\above{1pt} {{G_1} | {G_2}}$";
    conjunction_negation: string = "$\\lnot({G_1} \\land {G_2}) \\above{1pt} {{\\lnot{G_1} | \\lnot{G_2}}}$";
    disjunction_negation: string = "$\\lnot({G_1} \\lor {G_2}) \\above{1pt} {\\lnot{G_1} \\atop \\lnot{G_2}}$";

    implication: string = "${G_1} \\rightarrow {G_2} \\above{1pt} {\\lnot{G_1} | {G_2}}$";
    equivalenz: string = "${G_1} \\leftrightarrow {G_2} \\above{1pt} {(\\lnot{G_1} \\lor{G_2}) \\atop (\\lnot{G_2} \\lor {G_1})}$";
    implication_negation: string = "$\\lnot{({G_1} \\rightarrow {G_2})} \\above{1pt} {{G_1} \\atop \\lnot{G_2}}$";
    equivalenz_negation: string = "$\\lnot{({G_1} \\leftrightarrow {G_2})} \\above{1pt} {({G_1} \\land \\lnot{G_2}) | ({G_2} \\land \\lnot{G_1})}$";
}


@Component({
    selector: 'app-tableau-summary',
    templateUrl: './tableau-summary.html'
})
export class TableauSummaryComponent {
}
