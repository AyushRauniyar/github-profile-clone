import { Component } from '@angular/core';

@Component({
  selector: 'app-maintenance',
  template: `
    <div class="maintenance-container">
      <div class="maintenance-content">
        <svg class="maintenance-icon" width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
        </svg>
        <h2>Under Maintenance</h2>
        <p>This feature is currently under development and will be available soon.</p>
      </div>
    </div>
  `,
  styles: [`
    .maintenance-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 200px);
      padding: 48px 24px;
      background: #fff;
    }

    .maintenance-content {
      text-align: center;
      max-width: 480px;
    }

    .maintenance-icon {
      width: 64px;
      height: 64px;
      color: #57606a;
      margin-bottom: 24px;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #24292f;
      margin: 0 0 12px 0;
    }

    p {
      font-size: 1rem;
      color: #57606a;
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class MaintenanceComponent {}
