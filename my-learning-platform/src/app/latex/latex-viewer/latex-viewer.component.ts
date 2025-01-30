import { Component, OnInit, AfterViewInit, input } from '@angular/core';

declare var MathJax: any;

@Component({
    selector: 'app-latex-viewer',
    templateUrl: './latex-viewer.component.html',
    styleUrls: ['./latex-viewer.component.css']
})
export class LatexViewerComponent implements OnInit, AfterViewInit {
    readonly latexString = input<string>();

    constructor() {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.renderMathJax();
    }

    ngOnChanges(): void {
        this.renderMathJax();
    }

    renderMathJax() {
        if (MathJax) {
            MathJax.typesetPromise();
        }
    }
}
