/**
 * This file contains functions to show the current explanation for the applied literals.
 */

import { Renderer2 } from "@angular/core";

let renderer: Renderer2;

export function provideRenderer(renderer2: Renderer2) {
    renderer = renderer2;
}

// Show explanation for the current step
export function showExplanation(type:string="", satisfaction:boolean|undefined, size:number|null=0, parent:string[][]=[], literal:string|string[]=[], child:string[][]=[]) {
    let explanation: string = "";
    console.log("explanation:", type, satisfaction, size, parent, literal, child);

    if (type === 'create') {
        if (size === 1) {
            // Create root
            explanation = "Wandle die KNF in Mengenschreibweise um und Erstelle die Wurzel des Graphen.";

        } else if (typeof literal === 'string') {
            // Format array
            let parentStr = formatStringArray(parent);

            // Apply literal
            let line3 = applyLiteral(parent, literal, child);

            let line1 = `Hole das letzte Literal und dessen Parent aus den unverwendeten abgespeicherten negierten Literalen.`;
            let line2 = `Literal: ${literal}, Parent: ${parentStr}`;

            explanation = `${line1}<br>${line2}<br><br>${line3}`;
        }

    } else if (type === 'single') {

        if (parent.length !== 0 && typeof literal === 'string' && literal.length !== 0) {
            // Apply literal
            explanation = applyLiteral(parent, literal, child);
        }

    } else if (type === 'literal') {

        if (typeof literal === 'string') {
            // Choose a single literal
            
            // format arrays
            let parentStr = formatStringArray(parent);

            let line1 = `Die Formel ${parentStr} enthält ein Single-Literal in ${literal}.`;
            let line2 = `Es wird ${literal} ausgewählt.`;
            explanation = `${line1}<br>${line2}`;

        } else if (Array.isArray(literal) && literal.length === 2) {
            // Choose multy literal

            // format arrays
            let parentStr = formatStringArray(parent);

            let line1 = `Die Formel ${parentStr} enthält kein Single-Literal.`;
            let line2 = `Es wird das Literal ${literal[0]} ausgewählt.`;
            let line3 = `Das Komplement des Literals, ${literal[1]}, wird gespeichert.`;
            explanation = `${line1}<br>${line2}<br>${line3}`;
        }

    } else if (type === 'check') {

        if (satisfaction === undefined) {
            // Current branch is not finished yet
            let line1 = `Die aktuelle Formel enthält keine leere Menge und ist auch keine leere Menge.`;
            let line2 = `Der aktuelle Zweig ist noch nicht beendet.`;
            explanation = `${line1}<br>${line2}`;

        } else if (size !== null) {
            // Check branch

            if (satisfaction) {
                // Set is empty
                let line1 = `Der aktuelle Zweig ist erfüllbar.`;
                let line2 = `Es konnte eine leere Menge erzeugt werden.`;
                explanation = `${line1}<br>${line2}`;

            } else {
                // Set contains empty clause
                let line1 = `Der aktuelle Zweig ist nicht erfüllbar.`;
                let line2 = `Es wurde eine Menge erzeugt, welche die leere Menge enthält.`;
                explanation = `${line1}<br>${line2}`;
            }

        } else {
            // Check finished procedure

            if (satisfaction) {
                // Set is empty
                let line1 = `Nach dem DPLL-Verfahren ist die Formel erfüllbar.`;
                let line2 = `Es konnte mindestens eine leere Menge erzeugt werden.`;
                explanation = `${line1}<br>${line2}`;

            } else {
                // Set contains empty clause
                let line1 = `Nach dem DPLL-Verfahren ist die Formel nicht erfüllbar.`;
                let line2 = `Es konnten nur Mengen erzeugt werden, welche die leere Menge enthalten.`;
                explanation = `${line1}<br>${line2}`;
            }
        }

    } else if (type === 'rerun') {
        // reset the order
        explanation = `Durchlauf ist abgeschlossen. Es wird ein neuer Durchlauf vorbereitet.`;

    } else {
        explanation = "";
    }

    changeExplanation(explanation);
}

function changeExplanation(explanation: string) {
    const paragraph = document.getElementById('dpll-example-explanation');
    if (paragraph !== null) {
        paragraph.innerHTML = explanation;
    }
}

function applyLiteral(parent: string[][], literal: string, child: string[][]) {
    // Format the array to set-notation
    let parentStr = formatStringArray(parent);
    let childStr = formatStringArray(child);

    let line1 = `Erstelle aus ${parentStr}, unter Anwendung des Literals ${literal}, das Kind ${childStr}.`;
    let line2 = "Entferne alle Klauseln, in denen das Literal vorkommt.";
    let line3 = "Entferne aus allen übrigen Klauseln das Komplement des Literals.";

    let explanation = `${line1}<br><br>${line2}<br>${line3}`;
    return explanation;
}

function formatStringArray(array: string[][]): string {

    let outerArray = array
        .map(innerArray => `{${innerArray.map(str => `${str}`).join(',')}}`)
        .join(';');
    let formattedStr = `{${outerArray}}`;

    return formattedStr;
}
