
// Definition of the value-type for the branches
export interface ValueType {
    fromId: number;         // was created from an element with this idw
    literal: string;        // was created by applying this literal
    formula: string[][];    // content-formula of the element
}


/* This class will provide methods and functions for a custom map */
export class CustomMap {
    // Internal map, is used to handle the data
    private internalMap: Map<number, ValueType>;

    // Constructor to initialize the map
    constructor() {
        this.internalMap = new Map<number, ValueType>();
    }

    // Set entry to the map
    setMapEntry(key: number, value: ValueType): this {
        this.internalMap.set(key, value);
        return this; // Allows concatenation like a normal map
    }

    // Calls an entry in map
    get(key: number): ValueType | undefined {
        return this.internalMap.get(key);
    }

    // Checks if key is in map
    has(key: number): boolean {
        return this.internalMap.has(key);
    }

    // Deletes entry in map
    delete(key: number): boolean {
        return this.internalMap.delete(key);
    }

    // Deletes all entrys in map
    clear(): void {
        this.internalMap.clear();
    }

    // Calls the number of elements
    getSize(): number {
        return this.internalMap.size;
    }

    // Iterate through all entrys
    forEach(callback: (value: ValueType, key: number) => void): void {
        this.internalMap.forEach(callback);
    }

    // Returns key as iterable
    getKeys(): IterableIterator<number> {
        return this.internalMap.keys();
    }

    // Returns all entrys
    getValues(): IterableIterator<ValueType> {
        return this.internalMap.values();
    }

    // Returns all key-value pair
    getEntries(): IterableIterator<[number, ValueType]> {
        return this.internalMap.entries();
    }

    // Returns a specific value to a key and its property
    getSpecificMapEntry(key: number, property: keyof ValueType) {
        const entry = this.internalMap.get(key);
        return entry ? entry[property] : '';
    }

    // Returns a specific formula-value to a key
    getSpecificFormula(key: number) {
        const entry = this.internalMap.get(key);
        return entry?.formula;
    }

    // Returns a list of given type
    getSpecificValues(property: keyof ValueType): string[][][] {
        const result = [];
        let keys = [...this.getKeys()];
        for (let key of keys) {
            let formula = this.getSpecificMapEntry(key, 'formula');
            if (typeof formula !== 'number' && typeof formula !== 'string') {
                result.push(formula);
            }
        }
        return result;
    }

    // Returns map as array
    toArray(): [number, ValueType][] {
        return Array.from(this.internalMap.entries());
    }
}
