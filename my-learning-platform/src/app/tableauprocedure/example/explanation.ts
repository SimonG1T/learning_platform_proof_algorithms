import { Renderer2 } from "@angular/core";

let renderer: Renderer2;

/**
 * This file contains function to show the current explanation for the applied rule.
 */

export function provideRenderer(renderer2: Renderer2) {
    renderer = renderer2;
}

export function showExplanation(id: number|number[]=-1, rule: number=-1, child: string|string[]='', parent: string|boolean='', branch: number[]=[]) {

    let explanation: string = "";

    if (id === 0) {
        // show explanation for root
        explanation = `Erstelle die Wurzel des Tableau-Baumes.`;

    } else if ([1,3,5,35,6,7].includes(rule) && typeof child === 'string') {
        // show explanation for rule one, three/five, six, seven
        explanation = `Erstelle aus ${parent}, unter Verwendung der Regel ${rule}, das Kind ${child}.`;

    } else if (rule === 2) {
        // show explanation for rule two
        explanation = `Erstelle aus ${parent}, unter Verwendung der Regel ${rule}, die Kinder ${child[0]} und ${child[1]} untereinander.`;

    } else if (rule === 4) {
        // show explanation for rule four
        explanation = `Erstelle aus ${parent}, unter Verwendung der Regel ${rule}, die Kinder ${child[0]} und ${child[1]} als Verzweigung, indem der Zweig aufgeteilt wird.`;

    } else if (typeof parent === 'boolean') {

        if (parent && branch.length !== 0) {
            // show explanation for valid branch
            explanation = `Es gab keine Negation zu einer Variable in diesem Ast, somit ist er erfüllbar!`;

        } else if (!parent && branch.length !== 0) {
            // show explanation for no valid branch
            explanation = `Es gibt einen Widerspruch in diesem Ast: ${child[0]} hat eine Negation in ${child[1]}, daher ist dieser Ast nicht erfüllbar!`;

        } else if (parent && branch.length === 0) {
            // show explanation for fulfillability
            explanation = `Es gibt einen Ast, welcher erfüllbar ist, daher ist das Tableau erfüllbar!`;

        } else if (!parent && branch.length === 0) {
            // show explanation for un-fulfillability
            explanation = `Es gibt nur Äste, welche einen Widerspruch enthalten, daher ist das Tableau nicht erfüllbar!`;

        }
    }

    changeExplanation(explanation);
}

export function changeExplanation(explanation: string) {
    const paragraph = document.getElementById('tableau-example-explanation');

    if (paragraph !== null) {
        paragraph.textContent = explanation;
    }
}
