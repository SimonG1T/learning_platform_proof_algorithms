import { Component, Renderer2 } from '@angular/core';
import { Dictionary } from '../../generator/value-type';

import { provideRenderer, hoverTest, hoverTestResult } from './highlight-hover';
import { renderMath } from '../../../latex/latex-rendering';


/**
 * This class will handles the structure and creation of the tree for the tableau procedure
 */
@Component({
    selector: 'app-table-structure',
    templateUrl: './table-structure.component.html',
    styleUrl: './table-structure.component.css'
})
export class TableStructureComponent {

    constructor(private renderer: Renderer2) {}

    selectContainer(): Element | null {
        // Select the container element
        const container = document.querySelector('#tableau-tree');
        this.renderer.addClass(container, 'container');

        return container;
    }

    createTreeElement(container: Element): Element {

        // provide renderer to highlight-hover
        provideRenderer(this.renderer);

        const treeElement = this.renderer.createElement('div');

        this.renderer.setAttribute(treeElement, 'inputString', 'Created tree');
        this.renderer.appendChild(container, treeElement);

        return treeElement;
    }

    addRoot(parentElement: Element, input: string, dictionary: Dictionary) {
        let id = 0;

        // create div
        const rootElement = this.renderer.createElement('div');
        this.renderer.addClass(rootElement, 'center');
        this.renderer.setAttribute(rootElement, 'id', id.toString());

        // create span
        const context = this.renderer.createElement('span');

        // hover in test
        hoverTest(id, context, dictionary);

        context.innerText = "i am the root";

        // render input
        this.handleRendering(input, context);

        rootElement.appendChild(context);
        parentElement.appendChild(rootElement);
    }

    addChildElement(input: string, parentId: number, rule: string, dictionary: Dictionary) {
        // get parent element
        const parentElement = document.getElementById(parentId.toString());
        
        // add an element for the separation line
        const childConnector = this.renderer.createElement('div');
        this.renderer.addClass(childConnector, 'child-connector');
        if (parentElement !== null) {
            parentElement.appendChild(childConnector);
        }

        // create div
        const childElement = this.renderer.createElement('div');
        this.renderer.addClass(childElement, 'center');

        // calculate id
        let id = parentId;
        if (id.toString().includes('.')) {
            let nextStr = id.toString().split('.');
            let next = +nextStr[0] + 1;
            let lowerNextStr = next.toString() + '.' + nextStr[1];
            id = +lowerNextStr;
        } else {
            id++;
        }

        // create info
        const infoElement = this.renderer.createElement('div');
        this.renderer.addClass(infoElement, 'info');
        const infoContext = this.renderer.createElement('span');
        this.renderer.addClass(infoContext, 'info');
        infoContext.innerText = id.toString() + ":" + rule.toString();
        
        this.renderer.setAttribute(childElement, 'id', id.toString());

        // create span
        const context = this.renderer.createElement('span');
        // hover in test
        hoverTest(id, context, dictionary);

        context.innerText = "i am a single child";

        // render input
        this.handleRendering(input, context);

        // append elements
        infoElement.appendChild(infoContext);
        childElement.appendChild(context);
        if (parentElement !== null) {
            parentElement.appendChild(infoElement);
            parentElement.appendChild(childElement);
        }
    }

    addChildElements(input: Array<string>, parentId: number, rule: string, dictionary: Dictionary) {
        // get parent element
        const parentElement = document.getElementById(parentId.toString());

        // create container
        const containerElement = this.renderer.createElement('div');
        this.renderer.addClass(containerElement, 'flex-container');

        // create divs
        const child1 = this.renderer.createElement('div');
        const child2 = this.renderer.createElement('div');
        this.renderer.addClass(child1, 'left');
        this.renderer.addClass(child2, 'right');

        // calculate ids
        let id1 = this.transformNumber(parentId, false);
        let id2 = this.transformNumber(parentId, true);
        this.renderer.setAttribute(child1, 'id', id1.toString());
        this.renderer.setAttribute(child2, 'id', id2.toString());

        // create infos
        const infoElement1 = this.renderer.createElement('div');
        this.renderer.addClass(infoElement1, 'info');
        const infoContext1 = this.renderer.createElement('span');
        this.renderer.addClass(infoContext1, 'info');
        infoContext1.innerText = id1.toString() + ":" + rule.toString();

        const infoElement2 = this.renderer.createElement('div');
        this.renderer.addClass(infoElement2, 'info');
        const infoContext2 = this.renderer.createElement('span');
        this.renderer.addClass(infoContext2, 'info');
        infoContext2.innerText = id2.toString() + ":" + rule.toString();

        // create spans
        const context1 = this.renderer.createElement('span');
        const context2 = this.renderer.createElement('span');

        // hover in test
        hoverTest(id1, context1, dictionary);
        hoverTest(id2, context2, dictionary);

        context1.innerText = "i am child one";
        context2.innerText = "i am child two";

        // render inputs
        this.handleRendering(input[0], context1);
        this.handleRendering(input[1], context2);

        // append elements
        infoElement1.appendChild(infoContext1);
        infoElement2.appendChild(infoContext2);

        child1.appendChild(infoElement1);
        child2.appendChild(infoElement2);

        child1.appendChild(context1);
        child2.appendChild(context2);

        containerElement.appendChild(child1);
        containerElement.appendChild(child2);

        if (parentElement !== null) {
            parentElement.appendChild(containerElement);
        }
    }

    addResultElement(parentId: number, isValid: boolean, path: number[], dictionary: Dictionary) {
        // get parent element
        const parentElement = document.getElementById(parentId.toString());

        // create div
        const childElement = this.renderer.createElement('div');
        this.renderer.addClass(childElement, 'center');

        // calculate id
        let id = parentId + 1;
        this.renderer.setAttribute(childElement, 'id', id.toString());

        // create span
        const context = this.renderer.createElement('span');
        this.renderer.addClass(childElement, 'resutl');
        // hover in test
        hoverTestResult(parentId, context, isValid, path, dictionary);

        context.innerText = "i am a single child";

        let input = "";
        if (isValid) {
            input = '\\checkmark';
        } else {
            input = '\\bigotimes';
        }

        // render input
        this.handleRendering(input, context);

        // append elements
        if (parentElement !== null) {
            childElement.appendChild(context);
            parentElement.appendChild(childElement);
        }
    }

    transformNumber(num: number, isSecond: boolean): number {
        // calculate next nested children
        let integerPart = Math.floor(num) + 1;
        let decimalPart = num.toString().split('.')[1] || '';
        if (isSecond) {
            decimalPart += '2';
        } else {
            decimalPart += '1';
        }
        return parseFloat(`${integerPart}.${decimalPart}`);
    }

    handleRendering(input: string, element: HTMLElement) {
        renderMath(input, element);
    }
}
