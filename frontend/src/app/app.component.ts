import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <h1>Budget Tracker Lite</h1>
      <app-transaction-list></app-transaction-list>
      <app-reports></app-reports>
    </div>
  `
})
export class AppComponent {
  title = 'Budget Tracker Lite';
}
