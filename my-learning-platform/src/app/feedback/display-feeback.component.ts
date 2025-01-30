import { Component, OnInit } from '@angular/core';
import { FeedbackService } from './feedback.service';


/**
 * Class to use the feedback service
 */
@Component({
    selector: 'app-display-feedback',
    template: `<div id='feedback-container'><p [innerHTML]="feedback"></p></div>`,
    styleUrls: ['./feedback-component.css']
})
export class DisplayFeedbackComponent implements OnInit {
    feedback: string = '';

    constructor(private feedbackService: FeedbackService) {}

    ngOnInit(): void {
        this.feedbackService.feedback$.subscribe((message) => {
            this.feedback = message;
        });
    }
}
