import { Component } from '@angular/core';


/**
 * Class for the component of the fundamental knowledge
 */
@Component({
    selector: 'app-grundlagen',
    templateUrl: './grundlagen.component.html',
    styleUrl: './grundlagen.component.css'
})
export class GrundlagenComponent {

    grammatikenIsCollapsed: boolean = false;
    beweiseIsCollapsed: boolean = true;
    schlussregelnIsCollapsed: boolean = true;

    collapsedGrammatikenLabel = "Klicke um die Informationen für die Grammatiken anzuzeigen";
    collapsedBeweiseLabel = "Klicke um die Informationen für die Beweise anzuzeigen";
    collapsedSchlussregelnLabel = "Klicke um die Informationen für die Schlussregeln anzuzeigen";

    // Handle the collapsable switch between the fundamentals, the proofing and the closing rules
    toggleCollapse(choosen: number): void {
        this.grammatikenIsCollapsed = true;
        this.beweiseIsCollapsed = true;
        this.schlussregelnIsCollapsed = true;

        switch (choosen) {
            case 1:
                this.grammatikenIsCollapsed = false;
                break;
            case 2:
                this.beweiseIsCollapsed = false;
                break;
            case 3:
                this.schlussregelnIsCollapsed = false;
                break;
        }
    }
}
