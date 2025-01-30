import { Renderer2 } from "@angular/core";
import { Dictionary } from "../../generator/value-type";

let renderer: Renderer2;

/**
 * This class will allow to highlight the hovered nodes and
 * highlight its parent of which this node is created from.
 */
export function provideRenderer(renderer2: Renderer2) {
    renderer = renderer2;
}

export function hoverTest(id: number, span: any, dictionary: Dictionary) {

    // füge hover hinzu
    if (!dictionary.isEmpty()) {
        
        //renderer.setAttribute(context, 'id', 'span'+id);
        renderer.listen(span, 'mouseenter', () => {
            renderer.addClass(span, 'hover');
            onHover(id, dictionary);
        });
        renderer.listen(span, 'mouseleave', () => {
            renderer.removeClass(span, 'hover');
            
            const parents = document.querySelectorAll('span.hover-parent');
            parents.forEach((parent) => {
                renderer.removeClass(parent, 'hover-parent');
            });
        });
    }
}

export function hoverTestResult(parentId: number, span: any, isValid: boolean, path: number[], dictionary: Dictionary) {

    // handle highlight
    // add on hover enter
    renderer.listen(span, 'mouseenter', () => {
        renderer.addClass(span, 'hover');
        console.log("result hover", isValid);

        if (!isValid) {
            console.log("not valid -> hover");
            highlightInvalid(path, dictionary);
        }
    });

    // remove on hover leave
    renderer.listen(span, 'mouseleave', (e) => {
        renderer.removeClass(span, 'hover');

        const invalids = document.querySelectorAll('span.hover-invalid');
        invalids.forEach((element) => {
            renderer.removeClass(element, 'hover-invalid');
        });
    });
}

function onHover(id: number, dictionary: Dictionary) {
    console.log("id der hovered span", id);

    // highlight the parent give the rule
    const parentId = dictionary.getSpecificMapEntry(id, 'fromId');
    if (parentId === undefined) return;

    const div = document.getElementById(parentId.toString());
    
    if (div !== null) {
        const parent = div.firstChild;
        renderer.addClass(parent, 'hover-parent');

        const rule = dictionary.getSpecificMapEntry(id, 'rule');
        console.log(`rule on id ${id} is ${rule}`);
    }
}

export function highlightInvalid(invalidPath: number[], dictionary: Dictionary, isClickExample=false) {

    // highlight invalid variables on path
    let invalidTupel = [];
    let invalidVars: string[] = [];
    let vars: string[] = [];
    let keys: number[] = [];

    // get a list of literals
    for (let key of invalidPath) {
        let formula = dictionary.getSpecificMapEntry(key, 'formula');

        if (formula !== undefined) {
            formula = formula.toString();

            if (formula.length === 1 && /[A-Z]/.test(formula[0]) ||
                    formula.length === 2 && formula[0] === '!' && /[A-Z]/.test(formula[1])) {
                        invalidTupel.push([formula, key]);
                        // avoid duplications
                        if (!vars.includes(formula)) {
                            vars.push(formula);
                        }
                }
        }
    }
    console.log("formel von vars:", vars, invalidTupel);

    // check if the variables list contains var and its negation
    for (let letter of vars) {
        if (/[A-Z]/.test(letter) && vars.includes('!'+letter)) {
            invalidVars.push(letter);
            invalidVars.push('!'+letter);
        }
    }
    console.log("formel von invalid:", invalidVars);

    // get ids of invalid var
    for (let value of invalidVars) {
        console.log(value);
        for (let tupel of invalidTupel) {
            if (tupel[0] === value) {
                keys.push(+tupel[1]);
            }
        }
    }
    console.log("Keys of values", keys, invalidVars);

    // highlight invalid keys
    for (let key of keys) {
        console.log("invalid-hovers:", key);
        let div = document.getElementById(key.toString());
        if (div !== null) {
            let span = div.firstChild;
            if (span !== null && (div.classList.contains('left') || div.classList.contains('right'))) {
                // direct span child if it is splitted
                let sp = Array.from(div.children).find(child => child.tagName === 'SPAN');
                if (sp !== undefined) {
                    span = sp;
                }
            }
            // let span = div.querySelector('> span');
            if (isClickExample) {
                // add click in example
                renderer.addClass(span, 'click-container-invalid');
            } else {
                // add hover
                renderer.addClass(span, 'hover-invalid');
            }
        }
    }
}
