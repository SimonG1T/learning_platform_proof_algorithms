import { Component, OnInit } from "@angular/core";


/**
 * This class is the component for the theory of the resolution procedure
 */
@Component({
    selector: 'app-resolution-theory',
    templateUrl: './resolution-theory.component.html',
    styleUrls: ['./resolution-theory.component.css']
})
export class ResolutionTheoryComponent implements OnInit {

    isLast = false;

    name = "Theorie des Resolutionsverfahrens";

    line1 = '{{A,B};{!A,C}}';
    line2 = '{B,C}';

    currentContent = '';
    private currentId = 0;
    private numberOfContents = 7;

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
 * Class for the summary of resolution procedure
 */
@Component({
    selector: 'app-resolution-summary',
    templateUrl: './resolution-summary.html'
})
export class ResolutionSummaryComponent {
}
