import { Renderer2 } from "@angular/core";
import { Dictionary } from "../resolution-procedure/value-type-full";


/**
 * This class will allow to highlight the hovered nodes and
 * highlight its parent of which this node is created from.
 */

let renderer: Renderer2;

export function provideRenderer(renderer2: Renderer2) {
    renderer = renderer2;
}

// highlight the hovered spans and their parents for resolution
export function hoverTest(id: number, span: any, dictionary: Dictionary, res: string) {

    // add highlights if map is not empty
    if (!dictionary.isEmpty() || id === 0) {

        // highlight when mouse enters
        renderer.listen(span, 'mouseenter', () => {
            console.log("now hovered:", id, dictionary.getKeys().length);

            // hover node
            renderer.addClass(span, 'hover-v2');

            // hover parents if not root
            if (id !== 0) {

                let isContradiction = false;
                // Contains empty clause: {{}}
                let containsEmpty = dictionary.containsEmptyFormula();
                if (typeof containsEmpty === 'number' && id === containsEmpty) {
                    
                    // highlight invalid
                    isContradiction = true;
                }

                onHover(res, isContradiction);
            }
        });

        // remove highlight when mouse leaves
        renderer.listen(span, 'mouseleave', () => {
            renderer.removeClass(span, 'hover-v2');
            renderer.removeClass(span, 'hover-invalid');
            
            const parents = document.querySelectorAll('span.hover-parent');
            parents.forEach((parent) => {
                renderer.removeClass(parent, 'hover-parent');
            });
            const invalids = document.querySelectorAll('span.hover-invalid');
            invalids.forEach((invalid) => {
                renderer.removeClass(invalid, 'hover-invalid');
            });
        });
    }
}

function onHover(res: string, isContradiction=false) {
    let parentClass = 'hover-parent';
    let id1 = 0;
    let id2 = 0;

    if (isContradiction) {
        // highlight invalid
        parentClass = 'hover-invalid';
    }

    // get res-ids
    if (res.includes('res')) {
        let indexOpen = res.indexOf('(');
        let indexSeparator = res.indexOf(',');
        let indexClose = res.indexOf(')');
        let sub1 = res.substring(indexOpen+1, indexSeparator);
        let sub2 = res.substring(indexSeparator+1, indexClose);
        id1 = +sub1;
        id2 = +sub2;
    }

    // highlight the parent
    const div1 = document.getElementById(id1.toString());
    const div2 = document.getElementById(id2.toString());
    
    if (div1 !== null) {
        const parent = div1.firstChild;
        renderer.addClass(parent, parentClass);
    }
    if (div2 !== null) {
        const parent = div2.firstChild;
        renderer.addClass(parent, parentClass);
    }
}
