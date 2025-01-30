import { Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


/**
 * Service for the feedback
 */
@Injectable({
    providedIn: 'root',
})
export class FeedbackService {
    private feedbackSubject = new BehaviorSubject<string>('Willkommen im Feedback-Container!');
    private feedbackContainerId = "feedback-container";
    public feedback$: Observable<string> = this.feedbackSubject.asObservable();

    // Creates a message with red highlights
    errorMessage(message: string) {
        this.updateFeedback(message, "error");
    }

    // Creates a message with green highlights
    finishedMessage(message: string) {
        let oldMessage = this.feedbackSubject.getValue();
        let newMessage = `${oldMessage}<br><br>${message}`;
        this.updateFeedback(newMessage, "finished");
    }

    // Appends a message to the existing one
    doubleMessage(message: string) {
        let oldMessage = this.feedbackSubject.getValue();
        let newMessage = "";
        if (oldMessage.length === 0) {
            newMessage = message;
        } else {
            newMessage = `${oldMessage}<br>${message}`;
        }
        this.updateFeedback(newMessage);
    }

    // Creates a feedback message
    updateFeedback(message: string, highlightClass: string=""): void {
        this.feedbackSubject.next(message);

        let element = document.getElementById(this.feedbackContainerId);
        if (element !== null) {
            // remove all classes
            if (element.classList.length !== 0) {
                element.className = "";
            }

            // add highlight class
            if (highlightClass.length > 0) {
                element.classList.add(highlightClass);
            }
        }
    }
}
