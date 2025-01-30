import { Renderer2 } from "@angular/core";
import { TableStructureComponent } from "../../table-structure/table-structure.component";


/**
 * Create the tree for the dpll procedure
 */
export class TreeCreator {
    
    private instanceOfTableStructure = new TableStructureComponent(this.renderer);
    private container: Element | null = null;

    constructor(private renderer: Renderer2) {}

    // Generate the tree for the dpll procedure
    createTree(treeId:string="") {
        if (treeId.length === 0) {
            // tree-id of example
            treeId = '#dpll-tree';
        }
        // Select the container element
        const container = document.querySelector(treeId);
        this.renderer.addClass(container, 'container');

        // creates a div
        if (container !== null) {
            const tree = this.instanceOfTableStructure.createTreeElement(container);
            this.renderer.setAttribute(tree, 'textContent', "das ist ein Test");
            this.container = tree;
        }
    }

    addRoot(mySet:Set<string[]>) {
        let id = 0;
        let quantity = this.setToString(mySet);

        if (this.container !== null) {

            this.instanceOfTableStructure.addRoot(id, this.container, quantity);
        }

        this.highlightElementOnHover(id, -1);
    }

    addNode(id:number, literal:string, mySet:Set<string[]>, parentId:number=-1) {
        let quantity: string = "";
        quantity = this.setToString(mySet);

        if (id === 0) {
            this.createTree();
        }

        if (this.container !== null) {

            this.instanceOfTableStructure.addChild(id, this.container, literal, quantity);
        }

        this.highlightElementOnHover(id, parentId);
    }

    addContradictionNode(id:number, parentId:number=-1) {
        let qed = '{\\square}';

        if (this.container) {

            const centerElement = document.getElementById(id.toString());
            if (centerElement) {
                const spanElement = centerElement.querySelector('span');
                console.log("span:",spanElement);
                if (spanElement) {
                    this.instanceOfTableStructure.handleRendering(qed, spanElement);
                }
            }
        }

        this.highlightElementOnHover(id, parentId, true);
    }

    highlightClickElement(id: number) {
        let element = document.getElementById(id.toString());
        if (element) {
            this.renderer.addClass(element, 'click');
        }
    }

    highlightElementOnHover(id:number, parentId:number, isContradiction:boolean=false) {
        let element = document.getElementById(id.toString());

        // hover to highlight the parent to the node
        this.renderer.listen(element, 'mouseenter', () => {
            if (parentId !== -1) {
                let parentContainer = document.getElementById(parentId.toString());
                if (parentContainer !== null) {
                    let parentElement = parentContainer.querySelector('span');
                
                    if (isContradiction) {
                        this.renderer.addClass(parentElement, 'hover-invalid');
                    } else {
                        this.renderer.addClass(parentElement, 'hover-parent');
                    }
                }
            }
            this.renderer.addClass(element, 'hover');
        });

        this.renderer.listen(element, 'mouseleave', () => {
            this.removeHighlights();
        });
    }

    removeHighlights() {
        const elements = document.querySelectorAll('.hover');
        elements.forEach((element) => {
            this.renderer.removeClass(element, 'hover');
        });
            
        const parents = document.querySelectorAll('span.hover-parent');
        parents.forEach((parent) => {
            this.renderer.removeClass(parent, 'hover-parent');
        });

        const invalids = document.querySelectorAll('span.hover-invalid');
        invalids.forEach((invalid) => {
            this.renderer.removeClass(invalid, 'hover-invalid');
        });
    }

    removeClass(highlight: string='click') {
        const elements = document.querySelectorAll('.'+highlight);
        if (elements) {
            elements.forEach((element) => {
                this.renderer.removeClass(element, highlight);
            });
        }
    }

    setToString(setOfArrays: Set<string[]>) {
        const arrayStrings = Array.from(setOfArrays).map(array => `{${array.join(',')}}`);
        const setStrings = `{${arrayStrings.join(';')}}`;
        return setStrings;
    }
}
