import { Component, Injectable, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SingleValueService } from './single-value.service';

/**
 * This class will provide a navigation bar as header for switching through the pages.
 */
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
@Injectable({
    providedIn: 'root'
})
export class HeaderComponent implements OnInit {

    currentValue: string = '';
    collapsed = true;

    // routes
    homepage = '/';

    grundlagen = '/grundlagen';

    routeRTheory = '/resolution-theory';
    routeRExample = '/resolution-example';
    routeRTest = '/resolution-test';
    routeRExercise = '/resolution-exercise';

    routeTTheory = '/tableau-theory';
    routeTExample = '/tableau-example';
    routeTTest = '/tableau-test';
    routeTExercise = '/tableau-exercise';

    routeDTheory = '/dpll-theory';
    routeDExample = '/dpll-example';
    routeDTest = '/dpll-test';
    routeDExercise = '/dpll-exercise';

    // ids for link text
    idHome = "header-link-home";
    idGrundlagen = "header-link-grundlagen";
    idTheory = "header-link-theory";
    idExample = "header-link-example";
    idTest = "header-link-test";
    idExercise = "header-link-exercise";
    
    currentRoute: string = '';
    textTheory: string = '';
    textExample: string = '';
    textTest: string = '';
    textExercise: string = '';

    constructor(private router: Router, private singleValueService: SingleValueService) {

        this.router.events.subscribe((event) => {
    
            if (event instanceof NavigationEnd) {
                this.currentRoute = event.urlAfterRedirects;
                this.collapsed = true;
                this.handleSubscribtion(this.currentRoute);
                this.updateLinkText();
                this.highlightElement();
            }
        });
    }

    ngOnInit(): void {
        // Subscribe to the Observable to react to changes
        this.singleValueService.value$.subscribe(value => {
            this.currentValue = value;
        });
    }

    // Call the methode to change the subscription
    changeSubscriptionValue(newValue: string): void {
        this.singleValueService.setValue(newValue);
    }

    // Get the destinations for the links

    getLinkTheory(): string {
        let single = this.singleValueService.getValue();

        if (single === 'resolution') {
            return this.routeRTheory;

        } else if (single === 'tableau') {
            return this.routeTTheory;

        } else if (single === 'dpll') {
            return this.routeDTheory;

        } else {
            return '';
        }
    }

    getLinkExample(): string {
        let single = this.singleValueService.getValue();

        if (single === 'resolution') {
            return this.routeRExample;

        } else if (single === 'tableau') {
            return this.routeTExample;

        } else if (single === 'dpll') {
            return this.routeDExample;

        } else {
            return '';
        }
    }

    getLinkTest(): string {
        let single = this.singleValueService.getValue();

        if (single === 'resolution') {
            return this.routeRTest;

        } else if (single === 'tableau') {
            return this.routeTTest;

        } else if (single === 'dpll') {
            return this.routeDTest;

        } else {
            return '';
        }
    }

    getLinkExercise(): string {
        let single = this.singleValueService.getValue();

        if (single === 'resolution') {
            return this.routeRExercise;

        } else if (single === 'tableau') {
            return this.routeTExercise;

        } else if (single === 'dpll') {
            return this.routeDExercise;

        } else {
            return '';
        }
    }

    // Check if link is shown
    // theory, example and exercise are only shown in a procedure page
    isLinkDisabled(): boolean {

        if (this.currentRoute === '/' || this.currentRoute === this.grundlagen) {

            return true;
        }
        return false;
    }

    // Handle the observable to change the link for the procedures
    handleSubscribtion(currentRoute: string) {

        if (currentRoute === this.routeRTheory || currentRoute === this.routeRExample ||
                currentRoute === this.routeRTest || this.currentRoute === this.routeRExercise) {
            // subscribe resolution
            this.changeSubscriptionValue('resolution');

        } else if (currentRoute === this.routeTTheory || this.currentRoute === this.routeTExample ||
                currentRoute === this.routeTTest || this.currentRoute === this.routeTExercise) {
            // subscribe tableau
            this.changeSubscriptionValue('tableau');

        } else if (currentRoute === this.routeDTheory || this.currentRoute === this.routeDExample ||
            currentRoute === this.routeDTest || this.currentRoute === this.routeDExercise) {
            // subscribe dpll
            this.changeSubscriptionValue('dpll');

        } else {
            // unsubscribe
            this.changeSubscriptionValue('');
        }

        console.log("single-subscribtion", this.singleValueService.getValue());
    }

    // Handle text of links
    updateLinkText() {
        let single = this.singleValueService.getValue();

        if (single === 'resolution' || single === 'tableau' || single === 'dpll') {

            this.changeLinkText(this.idExample, 'Example');
            this.changeLinkText(this.idTest, 'Test');
            this.changeLinkText(this.idExercise, 'Exercise');
        }

        if (single === 'resolution') {
            this.changeLinkText(this.idTheory, 'Resolution');

        } else if (single === 'tableau') {
                this.changeLinkText(this.idTheory, 'Tableau');

        } else if (single === 'dpll') {
            this.changeLinkText(this.idTheory, 'DPLL');

        }
    }

    changeLinkText(id: string, context: string) {
        let element = document.getElementById(id);
        if (element !== null) {
            element.innerText = context;
        }
    }

    // Highlight the current element as bold print
    highlightElement() {
        let highlightClass = 'highlight-header';
        let queryHighlight = '.' + highlightClass;
        let id: string = '';

        console.log("current-route:", this.currentRoute);

        // remove the highlight-class from all ids         
        Array.from(document.querySelectorAll(queryHighlight)).forEach(
            (el) => el.classList.remove(highlightClass)
        );

        // get the id of the current header element
        if (this.currentRoute === this.homepage) {
            id = this.idHome;

        } else if (this.currentRoute === this.grundlagen) {
            id = this.idGrundlagen;

        } else if (this.currentRoute.includes('theory')) {
            id = this.idTheory;

        } else if (this.currentRoute.includes('example')) {
            id = this.idExample;

        } else if (this.currentRoute.includes('test')) {
            id = this.idTest;

        } else if (this.currentRoute.includes('exercise')) {
            id = this.idExercise;
        }

        // add highlight to the current header element
        let element: any = document.getElementById(id);
        element.classList.add(highlightClass);
    }
}
