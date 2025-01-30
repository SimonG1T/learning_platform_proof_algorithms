
// Definition of the valuetype
export interface ValueType {
    fromIds: number[];  // was created from these ids
    clause: string[];   // formula of the element
}

// Dictionary of procedures
export class Dictionary {
    // id fromId rule formula
    private map: Map<number, ValueType>;

    constructor() {
        this.map = new Map<number, ValueType>();
    }

    public getMap(): Map<number, ValueType> {
        return this.map;
    }

    public clearMap(): void {
        this.map.clear();
    }

    public isEmpty(): boolean {
        let isEmpty: boolean = false;
        if (this.map.size === 0) {
            isEmpty = true;
        }
        return isEmpty;
    }

    public getSize(): number {
        return this.map.size;
    }

    // returns value to key
    public getMapEntry(key: number): ValueType | undefined {
        return this.map.get(key);
    }

    // returns list of keys
    public getKeys(): number[] {
        let keys: number[] = [];
        keys = [...this.map.keys()];
        // keys.sort((a,b) => a - b);
        return keys;
    }

    // returns list of values
    public getValues() {
        let values: IterableIterator<ValueType>;
        values = this.map.values();
        return values;
    }

    // returns list of specific values
    public getValuesOfType(property: keyof ValueType) {
        const values = [];
        for (const value of this.map.values()) {
            values.push(value[property]);
        }
        return values;
    }

    // returns specific value to value and property
    public getValueByValue(value: any, property: keyof ValueType, returnProperty: keyof ValueType) {
        let key = this.getKeysByValue(value, property);
        let result = this.getSpecificMapEntry(key[0],returnProperty);
        return result;
    }

    // returns list of keys to value
    getKeysByValue(value: any, property: any): number[] {
        return this.getKeys().filter(key => {
            const dictValue = this.getSpecificMapEntry(key,property);
            return this.arraysEqual(dictValue, value);
        });
    }

    // returns specific value to key
    public getSpecificMapEntry(key: number, property: keyof ValueType): (number | string)[] {
        const entry = this.map.get(key);
        return entry ? entry[property] : [];
    }

    // returns specific from ids to key
    public getSpecificFromIds(key: number): number[] {
        let value = this.getSpecificMapEntry(key, 'fromIds');
        if (Array.isArray(value) && value.every(item => typeof item === 'number')) {
            return value;
        }
        return [];
    }

    // returns specific formula to key
    public getSpecificFormula(key: number): string[] {
        let value = this.getSpecificMapEntry(key, 'clause');
        if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
            return value;
        }
        return [];
    }

    // returns last formula
    public getLastFormula(): string[] {
        let lastKey = this.getSize()-1;
        return this.getSpecificFormula(lastKey);
    }

    // the dictionary contains an empty formula
    public containsEmptyFormula(): number | undefined {
        let keys = this.getKeys();
        for (let k of keys) {
            let formula = this.getSpecificFormula(k);
            if (formula.length === 0) {
                return k;
            }
        }
        return;
    }

    // the dictionary contains the property with the given value
    public valueIsInDictionary(property: keyof ValueType, value: any): boolean {
        let valuesOfType = this.getValuesOfType(property);
        // Iterate through the dictionary
        for (let valueOfType of valuesOfType) {
            // Check if the property contains the given value
            if (this.arraysEqual(valueOfType, value)) {
                return true;
            }
        }
        return false;
    }

    // Update the map
    public setMapEntry(key:number, value:ValueType): void {
        this.map.set(key, value);
    }

    public displayMapEntries(): void {
        this.map.forEach((value, key) => {
            console.log(`${key}: res(${value.fromIds[0]},${value.fromIds[1]}) -> ${value.clause}`);
        });
    }

    arraysEqual(arr1: any[], arr2: any[]): boolean {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
}
