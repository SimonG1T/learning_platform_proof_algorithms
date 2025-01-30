import { Component, OnInit, Renderer2 } from "@angular/core";

import { handleRenderingWithId } from '../../latex/latex-rendering'


/**
 * Class to handle the fundamentals on the grammar of logic
 */
@Component({
    selector: 'grundlagen-grammatiken',
    templateUrl: './grammatiken-grundlagen.html',
    styleUrls: ['../grundlagen.component.css']
})
export class GrammatikenGrundlagen implements OnInit {

    constructor(private renderer: Renderer2) {}

    ngOnInit() {
        handleRenderingWithId(this.renderer, '!', "negation");
        handleRenderingWithId(this.renderer, '&', "conjunction");
        handleRenderingWithId(this.renderer, '|', "disjunction");
        handleRenderingWithId(this.renderer, '->', "implication");
        handleRenderingWithId(this.renderer, '<->', "equivalenz");
        handleRenderingWithId(this.renderer, 'allquantor', "allquantor");
        handleRenderingWithId(this.renderer, 'existenzquantor', "existenzquantor");
    }
}

/**
 * Class to handle the fundamentals on proof in logic
 */
@Component({
    selector: 'grundlagen-beweise',
    templateUrl: './beweise-grundlagen.html',
    styleUrls: ['../grundlagen.component.css']
})
export class BeweiseGrundlagen implements OnInit {

    constructor(private renderer: Renderer2) {}

    ngOnInit() {
        handleRenderingWithId(this.renderer, '!', "negation");
        handleRenderingWithId(this.renderer, '&', "conjunction");
        handleRenderingWithId(this.renderer, '|', "disjunction");
        handleRenderingWithId(this.renderer, '->', "implication");
        handleRenderingWithId(this.renderer, '<->', "equivalenz");
        handleRenderingWithId(this.renderer, 'allquantor', "allquantor");
        handleRenderingWithId(this.renderer, 'existenzquantor', "existenzquantor");
    }
}

/**
 * Class to handle the closing rules
 */
@Component({
    selector: 'grundlagen-schlussregeln',
    templateUrl: '../files/schlussregeln-grundlagen.html',
    styleUrls: ['../grundlagen.component.css']
})
export class SchlussregelnGrundlagen implements OnInit {

    constructor(private renderer: Renderer2) {}

    // Modus Tollendo Tollens
    schemeModusTollens: string = "${ {{A} \\rightarrow {B}} \\atop {\\lnot {B}} } \\above{2pt} \\lnot{A}$";

    examplePremise = "{Wenn \\space es \\space geregnet \\space hat, \\space ist \\space die \\space Strasse \\space nass.}";
    exampleTollendo = "{Die \\space Strasse \\space ist \\space nass.}";
    exampleTollens = "{Es \\space hat \\space geregnet.}";
    exampleModusTollens: string = "${" + this.examplePremise +  '\\atop' + this.exampleTollendo + "}" + '\\above{2pt}' + this.exampleTollens + "$";

    // Modus Ponendo Ponens
    schemeModusPonens: string = "${ {{A} \\rightarrow {B}} \\atop {A} } \\above{2pt} {B}$";

    examplePonensPremise = "{Wenn \\space es \\space regnet, \\space wird \\space die \\space Strasse \\space nass.}";
    examplePonendo = "{Es \\space regnet.}";
    examplePonens = "{Die \\space Strasse \\space wird \\space nass.}";
    exampleModusPonens: string = "${" + this.examplePonensPremise +  '\\atop' + this.examplePonendo + "}" + '\\above{2pt}' + this.examplePonens + "$";

    ngOnInit() {
        handleRenderingWithId(this.renderer, '!(!A)equivalenzA', "double-negation");
        handleRenderingWithId(this.renderer, '!(A&B)equivalenz!A|!B', "de-morgan-and");
        handleRenderingWithId(this.renderer, '!(A|B)equivalenz!A&!B', "de-morgan-or");
        handleRenderingWithId(this.renderer, 'A&AequivalenzA', "indem-and");
        handleRenderingWithId(this.renderer, 'A|AequivalenzA', "indem-or");
    }
}
