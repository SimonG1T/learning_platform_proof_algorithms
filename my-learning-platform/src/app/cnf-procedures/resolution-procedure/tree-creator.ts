import { Renderer2 } from "@angular/core";
import { TableStructureComponent } from "../table-structure/table-structure.component";
import { Dictionary } from "./value-type-full";
import { provideRenderer } from "../table-structure/highlight-hover";


/**
 * Create the tree for the resolution procedure
 */
export class TreeCreator {
    
    private instanceOfTableStructure = new TableStructureComponent(this.renderer);
    private container: Element | null = null;

    constructor(private renderer: Renderer2) {}

    // Generate container
    createTable() {

        // Provide renderer to highlight-hover
        provideRenderer(this.renderer);

        // Select the container
        const container = document.querySelector('#resolution-full');
        this.renderer.addClass(container, 'container');

        // Create a container
        if (container !== null) {
            const tree = this.instanceOfTableStructure.createTreeElement(container);
            this.renderer.setAttribute(tree, 'textContent', "das ist ein Tree");

            this.container = container;
        }
    }

    // Generate step by step
    generateTable(dictionary: Dictionary, id: number) {

        // Get clause
        let clause = dictionary.getSpecificFormula(id);

        // Handle root
        if (id === 0) {

            // Create tree element
            this.createTable();

            if (this.container !== null) {

                // Create the root
                let clauseStr = '{' + clause.join(';') + '}';
                this.instanceOfTableStructure.addRoot(id, this.container, clauseStr, true);
            }

        } else if (this.container !== null) {
            // Get res()
            let res:string = this.getRes(dictionary, id);

            // Handle nodes
            let clauseStr = '{' + clause.join(',') + '}';
            this.instanceOfTableStructure.addChildElement(id, this.container, clauseStr, res, dictionary);
        }
    }

    removeClicked() {
        Array.from(document.querySelectorAll('.click')).forEach(
            (el) => el.classList.remove('click')
        );

        Array.from(document.querySelectorAll('.click-invalid')).forEach(
            (el) => el.classList.remove('click-invalid')
        );
    }

    getRes(dictionary:Dictionary, key: number): string {
        let res = dictionary.getSpecificMapEntry(key, 'fromIds');
        let result;
        res[0] === 0 ? result = `(${res[0]})` : result = `res(${res[0]},${res[1]})`;
        return result;
    }
}
