import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug_report.component.html',
  styleUrls: ['./bug_report.component.css'],
})
export class BugReportComponent {
  private backend_addr: string = "/api";

  selectedFeedbackType: string = 'bug';
  feedbackText: string = '';
  feedbackSubmitted: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  submitFeedback() {
    // Validate input before submitting (e.g., check if feedbackText is not empty)

    const feedbackData = {
      type: this.selectedFeedbackType,
      content: this.feedbackText,
    };

    const options = { withCredentials: true };

    this.http.post<any>(`${this.backend_addr}/report`, feedbackData, options).subscribe({
      next: (response) => {
        console.log('Feedback submitted successfully:', response);
        // Update the feedbackSubmitted variable to show the confirmation message
        this.feedbackSubmitted = true;
        this.feedbackText = '';
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        // Handle the error, e.g., show an error message to the user.
      },
    });
  }
}
