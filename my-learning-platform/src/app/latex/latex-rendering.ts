import { Renderer2 } from "@angular/core";
import katex from "katex";


/**
 * This file contains mehtods to render math with katex
 */

export function handleRenderingWithId(renderer: Renderer2, input: string, id: string) {

    let containerElement = document.getElementById(id);

    // create span
    const element = renderer.createElement('span');
    element.innerText = "i am a span";

    // render input
    renderMath(input, element);

    // append the element
    if (containerElement !== null) {
        containerElement.appendChild(element);
    }
}

export function renderMath(input: string, element: HTMLElement, output: "html" | "mathml" | "htmlAndMathml"="html"): void {

    // Transform input
    input = transformToLogic(input);
    
    // Remove whitespace from the input
    input = input.replace(/\s+/g, '');

    // Prevent the rendering of html and mathml
    if (element) {
        // Render only in HTML or MathML, depending on configuration
        katex.render(input, element, {
            throwOnError: false,
            output: output, // set the desired output format
        });
    }
}
    
function transformToLogic(input: string): string {
    let transformed: string = "";

    
    transformed = input.replaceAll('}', '\\rbrace');
    transformed = transformed.replaceAll('{', '\\lbrace{}');

    transformed = transformed.replaceAll('!', '\\lnot{}');

    transformed = transformed.replaceAll('|', '\\lor{}');
    transformed = transformed.replaceAll('&', '\\land{}');

    transformed = transformed.replaceAll('<->', '\\leftrightarrow{}');
    transformed = transformed.replaceAll('->', '\\rightarrow{}');

    transformed = transformed.replaceAll('allquantor', '\\forall{}');
    transformed = transformed.replaceAll('existenzquantor', '\\exists{}');

    transformed = transformed.replaceAll('equivalenz', '\\equiv{}');

    return transformed;
}
