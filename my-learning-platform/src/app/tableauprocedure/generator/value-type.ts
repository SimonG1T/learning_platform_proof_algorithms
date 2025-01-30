import { Injectable } from "@angular/core";

// Definition of the value-type for the tableau procedure
export interface ValueType {
    fromId: number;     // was created from this id
    rule: number;       // was created by using this rule
    formula: string;    // formula of the element
}

// Dictionary of the tableau
@Injectable({
    providedIn: 'root'
})
export class Dictionary {

    // key-value map
    // id fromId rule formula
    private map: Map<number, ValueType>;

    constructor() {
        this.map = new Map<number, ValueType>();
    }

    // delete all entries of the map
    public clearMap(): void {
        this.map.clear();
    }

    // deletes one entry of the map
    deleteEntry(key: number): boolean {
        return this.map.delete(key);
    }

    // checks if map is empty
    public isEmpty(): boolean {
        let isEmpty: boolean = false;
        if (this.map.size === 0) {
            isEmpty = true;
        }
        return isEmpty;
    }
    
    // returns the map
    public getMap(): Map<number, ValueType> {
        return this.map;
    }

    // returns value to key
    public getMapEntry(key: number): ValueType | undefined {
        return this.map.get(key);
    }

    // checks if key exist in map
    has(key: number): boolean {
        return this.map.has(key);
    }

    // returns the size of the map
    size(): number {
        return this.map.size;
    }

    // returns list of keys
    public getKeys(): number[] {
        let keys: number[] = [];
        keys = [...this.map.keys()];
        keys.sort((a,b) => a - b);
        return keys;
    }

    // returns list of keys to a value
    getKeysByValue(value: any, property: any): number[] {
        return this.getKeys().filter(key => {
            const dictValue = this.getSpecificMapEntry(+key,property);
            return dictValue === value;
        });
    }

    // returns specific value to key
    public getSpecificMapEntry(key: number, property: keyof ValueType) {
        const entry = this.map.get(key);
        return entry ? entry[property] : '';
    }

    // add an entry to the map
    public setMapEntry(key:number, value:ValueType): void {
        this.map.set(key, value);
    }

    // returns an iterable of the map entries
    getEntries(): IterableIterator<[number, ValueType]> {
        return this.map.entries();
    }

    // deep copy of map
    deepCopyMap(): Dictionary {
        const newMap = new Dictionary;

        for (const [key,value] of this.map.entries()) {
            // deep copy of value-type
            const copiedValue: ValueType = {
                fromId: value.fromId,
                rule: value.rule,
                formula: value.formula
            };
            newMap.setMapEntry(key,copiedValue);
        }
        return newMap;
    }

    public displayMapEntries(): void {
        this.map.forEach((value, key) => {
            console.log(`${key}: ${value.fromId, value.rule, value.formula}`)
        });
        // console.log(this.map);
    }
}
