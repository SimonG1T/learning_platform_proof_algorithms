import { Dictionary } from "../value-type-full";


/**
 * This class will show the current explanation for the combined clausels.
 */
export function showExplanation(type:string|boolean='', map:Dictionary, parentIds:number[]=[], complement:string[]=[], newChild:boolean=false) {
    let explanation: string = "";
    let mapSize = map.getSize();
    console.log(`Abfrage: map-size:${mapSize}, parent-ids-length:${parentIds.length}, new-child:${newChild}, complement:${complement}, type:${type}`);

    if (mapSize === null || mapSize === 0) {
        explanation = "";
    } else if (mapSize === 1) {
        // Root
        explanation = "Wandle die KNF in Mengenschreibweise um und Erstelle die Wurzel des Graphen.";

    } else if (parentIds.length !== 0 && parentIds[0] === parentIds[1]) {
        // Base creator
        explanation = "Erstelle die Knoten zu den ursprünglichen Klauseln.";

    } else if (type === false && parentIds.length === 0) {
        // Not achievable
        let childId = mapSize-1;
        explanation = `Die ursprüngliche Formel ist unerfüllbar.<br>Der Graph enthält eine leere Klauselmenge in ${childId}.`;

    } else if (type === true && parentIds.length === 0) {
        // Achievable
        explanation = "Die ursprüngliche Formel ist erfüllbar.<br>Es wurde keine leere Klauselmenge gefunden.";

    } else if (parentIds.length === 2 && newChild) {
        // Resolution was applied
        let parentStr1 = map.getSpecificFormula(parentIds[0]);
        let parentStr2 = map.getSpecificFormula(parentIds[1]);
        let childStr = map.getSpecificFormula(mapSize-1);
        let explanation1 = `res(${parentIds[0]},${parentIds[1]})`;
        let explanation2 = `Die Klauseln {${parentStr1}} und {${parentStr2}} beinhalten Komplementäre.`;
        let explanation3 = `Nach Kürzen der Komplementäre und deren Kombination erhält man als neue Klausel {${childStr}}.`;
        explanation = explanation1 + '<br>' + explanation2 + '<br>' + explanation3;

    } else if (parentIds.length === 2 && !newChild) {
        // No combinator
        let parentStr1 = map.getSpecificFormula(parentIds[0]);
        let parentStr2 = map.getSpecificFormula(parentIds[1]);
        let explanation1 = `res(${parentIds[0]},${parentIds[1]})`;
        let explanation2 = `Die Klauseln {${parentStr1}} und {${parentStr2}} beinhalten kein Komplementär.`;
        explanation = explanation1 + '<br>' + explanation2;

    } else {
        explanation = "Etwas lief schief!";
    }

    changeExplanation(explanation);
}

export function changeExplanation(explanation: string) {
    const paragraph = document.getElementById('resolution-example-explanation');
    if (paragraph !== null) {
        paragraph.innerHTML = explanation;
    }
}

// If a element was created at the end of each round
export function changeNewCreated(parentIds:number[], newCreated: boolean|undefined=undefined) {
    let explanation = '';
    const paragraph = document.getElementById('resolution-example-newcreated');

    if (paragraph !== null) {
        if (newCreated === undefined) {
            explanation = '';
        } else if (newCreated && parentIds.length !== 0) {
            // New clause were created
            let newCreated = parentIds.map(num => num + 1).join(", ");
            explanation = `Klauseln:<br>${newCreated}`;
    
        } else if (!newCreated && parentIds.length === 0) {
            // No new resolvent were found
            explanation = "Es ist keine weitere Resolvente ableitbar.<br>Es konnten keine neue Klauseln erzeugt werden.";
        }    
        paragraph.innerHTML = explanation;
    }
}
