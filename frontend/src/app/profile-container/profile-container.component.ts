import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-container',
  template: `
    <app-profile-tabs></app-profile-tabs>
    <app-maintenance *ngIf="showMaintenance"></app-maintenance>
    <main class="profile-page" *ngIf="!showMaintenance">
      <div class="profile-container">
        <aside class="profile-sidebar">
          <app-profile-sidebar></app-profile-sidebar>
        </aside>
        <section class="profile-main">
          <app-profile-main></app-profile-main>
        </section>
      </div>
    </main>
  `,
  styles: []
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  showMaintenance = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const username = params['username'];
        if (username) {
          this.userService.setUsername(username);
        }
      });

    // Watch for tab query param
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const tab = params['tab'];
        // Show maintenance for any tab other than overview (no tab = overview)
        this.showMaintenance = !!tab;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
