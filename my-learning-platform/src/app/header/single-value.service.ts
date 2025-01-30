import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


/**
 * Implementation for a service that uses a BehaviorSubject as a single observable
 */
@Injectable({
    providedIn: 'root'
})
export class SingleValueService {
    // Initializes the BehaviorSubject with an optional start value
    private valueSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public value$: Observable<string> = this.valueSubject.asObservable();

    // Set a new value for the subject
    setValue(newValue: string): void {
        this.valueSubject.next(newValue);
    }

    // Returns current value of the subject
    getValue(): string {
        return this.valueSubject.getValue();
    }
}
