import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { ProfileCountsService } from '../services/profile-counts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-tabs',
  templateUrl: './profile-tabs.component.html',
  styleUrls: ['./profile-tabs.component.css']
})
export class ProfileTabsComponent implements OnInit, OnDestroy {
  repoCount = 0;
  packageCount = 0;
  starCount = 0;
  projectCount = 0;
  selectedTab = 'Overview';
  currentUsername = '';
  private destroy$ = new Subject<void>();

  tabs = [
    { label: 'Overview', key: 'Overview', badge: null },
    { label: 'Repositories', key: 'Repositories', badge: () => this.repoCount },
    { label: 'Projects', key: 'Projects', badge: () => this.projectCount },
    { label: 'Packages', key: 'Packages', badge: () => this.packageCount },
    { label: 'Stars', key: 'Stars', badge: () => this.starCount }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private profileCountsService: ProfileCountsService
  ) {}

  ngOnInit(): void {
    // Get current username
    this.userService.username$
      .pipe(takeUntil(this.destroy$))
      .subscribe(username => {
        console.log('ProfileTabs - username received:', username);
        this.currentUsername = username;
        if (username) {
          this.fetchProfileCounts(username);
        }
      });

    // Watch for tab query param changes
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const tab = params['tab'];
        if (tab) {
          // Capitalize first letter to match tab keys
          this.selectedTab = tab.charAt(0).toUpperCase() + tab.slice(1);
        } else {
          this.selectedTab = 'Overview';
        }
      });
  }

  private fetchProfileCounts(username: string): void {
    console.log('Fetching profile counts for:', username);
    this.profileCountsService.getProfileCounts(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (counts) => {
          console.log('Profile counts received:', counts);
          this.repoCount = counts.repoCount;
          this.projectCount = counts.projectCount;
          this.packageCount = counts.packageCount;
          this.starCount = counts.starCount;
          console.log('Counts assigned:', {
            repoCount: this.repoCount,
            projectCount: this.projectCount,
            packageCount: this.packageCount,
            starCount: this.starCount
          });
        },
        error: (err) => {
          console.error('Error fetching profile counts:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    
    if (tab === 'Overview') {
      // Navigate to /{username} without query params
      this.router.navigate([`/${this.currentUsername}`]);
    } else {
      // Navigate to /{username}?tab={lowercase}
      this.router.navigate([`/${this.currentUsername}`], {
        queryParams: { tab: tab.toLowerCase() }
      });
    }
  }
}
