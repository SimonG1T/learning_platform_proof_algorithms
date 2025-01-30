import { Component, Renderer2 } from '@angular/core';
import { hoverTest } from './highlight-hover';
import { Dictionary } from '../resolution-procedure/value-type-full';

import { renderMath } from '../../latex/latex-rendering'; 


/**
 * This class will create a graph for the dpll and the result procedure.
 */
@Component({
    selector: 'app-grid-structure',
    templateUrl: './table-structure.component.html',
    styleUrl: './table-structure.component.css'
})
export class TableStructureComponent {

    constructor(private renderer: Renderer2) {}

    createTreeElement(container: Element): Element {

        const treeElement = this.renderer.createElement('div');

        this.renderer.setAttribute(treeElement, 'inputString', 'Created tree');
        this.renderer.appendChild(container, treeElement);

        return treeElement;
    }

    addRoot(id:number, parentElement:Element, input:string, isResolution:boolean=false) {

        // create div
        const rootElement = this.renderer.createElement('div');
        this.renderer.addClass(rootElement, 'center');
        this.renderer.setAttribute(rootElement, 'id', id.toString());

        // create span
        const context = this.renderer.createElement('span');
        context.innerText = "i am the root";

        // hover root for resolution
        if (isResolution) {
            hoverTest(id, context, new Dictionary, "");
        }

        // render input
        this.handleRendering(input, context);

        rootElement.appendChild(context);
        parentElement.appendChild(rootElement);
    }

    // for dpll procedure
    addChild(id:number, parentElement:Element, literal:string, input:string) {

        // create info
        const infoElement = this.renderer.createElement('div');
        this.renderer.addClass(infoElement, 'info');

        const infoContext = this.renderer.createElement('span');
        this.renderer.addClass(infoContext, 'info');
        infoContext.innerText = id.toString() + ":" + literal.toString();
        
        // create div
        const containerElement = this.renderer.createElement('div');
        this.renderer.addClass(containerElement, 'center');
        this.renderer.setAttribute(containerElement, 'id', id.toString());

        // create span
        const context = this.renderer.createElement('span');
        context.innerText = "i am a child";

        // render input
        this.handleRendering(input, context);

        // append elements
        infoElement.appendChild(infoContext);
        containerElement.appendChild(context);
        parentElement.appendChild(infoElement);
        parentElement.appendChild(containerElement);
    }

    // for resolution procedure
    addChildElement(id: number, containerElement:Element, input: string, res: string, map: Dictionary) {

        // create info
        const infoElement = this.renderer.createElement('div');
        this.renderer.addClass(infoElement, 'info');

        const infoContext = this.renderer.createElement('span');
        this.renderer.addClass(infoContext, 'info');
        infoContext.innerText = id + ": " + res;

        // create div
        const childElement = this.renderer.createElement('div');
        this.renderer.addClass(childElement, 'center');
        this.renderer.setAttribute(childElement, 'id', id.toString());

        // create span
        const context = this.renderer.createElement('span');

        // hover in test
        hoverTest(id, context, map, res);
        context.innerText = "i am a single child";

        // render input
        this.handleRendering(input, context);

        // append elements
        infoElement.appendChild(infoContext);
        childElement.appendChild(context);
        
        if (containerElement !== null) {
            containerElement.appendChild(infoElement);
            containerElement.appendChild(childElement);
        }
    }

    handleRendering(input: string, element: HTMLElement) {
        renderMath(input, element);
    }
}
