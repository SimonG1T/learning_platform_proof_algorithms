import { Component, OnInit } from "@angular/core";


/**
 * This class is the component for the theory of the dpll procedure
 */
@Component({
    selector: 'app-dpll-theory',
    templateUrl: './dpll-theory.component.html',
    styleUrls: ['./dpll-theory.component.css']
})
export class DpllTheoryComponent implements OnInit {

    isLast = false;

    name = "Theorie des DPLL-Verfahrens";

    lineF  = 'F   = { {A,B}; {C,!A}; {!B} }';
    lineFA = 'FA  = { {C}; {!B} }';
    lineFB = 'F!B = { {A}; {C,!A} }';

    currentContent = '';
    private currentId = 0;
    private numberOfContents = 6;

    ngOnInit() {
        this.currentId = 1;
        this.currentContent = 'content1';
    }

    // Handle the dynamic switch of the theory contents
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
 * Class for the summary of dpll procedure
 */
@Component({
    selector: 'app-dpll-summary',
    templateUrl: './dpll-summary.html'
})
export class DpllSummaryComponent {
}
