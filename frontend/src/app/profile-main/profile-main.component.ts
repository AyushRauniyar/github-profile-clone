import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ContributionsService, ContributionDay } from '../contributions.service';
import { ActivityOverviewService, ActivityReposResponse } from '../services/activity-overview.service';
import { UserService } from '../services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-main',
  templateUrl: './profile-main.component.html',
  styleUrls: ['./profile-main.component.css']
})
export class ProfileMainComponent implements OnInit, OnDestroy {
  totalContributions = 0;
  weeks: { days: { date: string; value: number; levelClass: string }[] }[] = [];
  currentYear = new Date().getFullYear();
  login = '';
  years: number[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013];
  showYearDropdown = false;
  pinnedRepos: any[] = [];
  activityPct: { commits: number; issues: number; prs: number; reviews: number } | null = null;
  reposData: ActivityReposResponse | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private contributionsService: ContributionsService,
    private activityOverviewService: ActivityOverviewService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.username$
      .pipe(takeUntil(this.destroy$))
      .subscribe(username => {
        this.login = username;
        this.reloadForYear(this.currentYear);
        this.fetchPinnedRepos();
        this.fetchActivityMix();
        this.fetchActivityRepos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchPinnedRepos() {
    this.contributionsService.getPinnedRepos(this.login).subscribe(res => {
      this.pinnedRepos = res.repos;
    });
  }

  getRangeForYear(y: number) {
    return {
      from: `${y}-01-01T00:00:00Z`,
      to: `${y}-12-31T23:59:59Z`
    };
  }

  reloadForYear(y: number) {
    console.log('Year clicked:', y);
    this.currentYear = y;
    const { from, to } = this.getRangeForYear(y);
    this.contributionsService
      .get(this.login, from, to)
      .subscribe(payload => {
        this.totalContributions = payload.totalContributions;
        this.weeks = this.buildWeeksGrid(payload.contributions);
      });
    // Reload activity data for the new year
    this.fetchActivityMix();
    this.fetchActivityRepos();
  }

  fetchActivityMix() {
    const { from, to } = this.getRangeForYear(this.currentYear);
    console.log('Fetching activity mix for:', this.login, from, to);
    this.activityOverviewService
      .getActivityMix(this.login, from, to)
      .subscribe({
        next: (res) => {
          console.log('Activity mix response:', res);
          this.activityPct = res.percentages;
        },
        error: (err) => {
          console.error('Error fetching activity mix:', err);
          // Set default values on error
          this.activityPct = { commits: 0, issues: 0, prs: 0, reviews: 0 };
        }
      });
  }

  fetchActivityRepos() {
    const { from, to } = this.getRangeForYear(this.currentYear);
    console.log('Fetching activity repos for:', this.login, from, to);
    this.activityOverviewService
      .getActivityRepos(this.login, from, to)
      .subscribe({
        next: (res) => {
          console.log('Activity repos response:', res);
          this.reposData = res;
        },
        error: (err) => {
          console.error('Error fetching activity repos:', err);
          // Set default values on error
          this.reposData = { top: [], extraCount: 0, total: 0 };
        }
      });
  }

  // Spider chart helper: Build SVG path for the activity blob
  buildSpiderPath(): string {
    if (!this.activityPct) return '';
    
    const cx = 150;
    const cy = 131;
    const R = 60;
    
    // Calculate points for each axis based on percentages
    const topX = cx;
    const topY = cy - R * (this.activityPct.reviews / 100);
    
    const rightX = cx + R * (this.activityPct.issues / 100);
    const rightY = cy;
    
    const bottomX = cx;
    const bottomY = cy + R * (this.activityPct.prs / 100);
    
    const leftX = cx - R * (this.activityPct.commits / 100);
    const leftY = cy;
    
    // Build path: Top -> Right -> Bottom -> Left -> back to Top
    return `M ${topX} ${topY} L ${rightX} ${rightY} L ${bottomX} ${bottomY} L ${leftX} ${leftY} Z`;
  }

  // Get axis endpoints and labels
  getSpiderData() {
    const cx = 150;
    const cy = 131;
    const R = 60;
    
    if (!this.activityPct) {
      return {
        axes: [],
        points: [],
        labels: []
      };
    }
    
    return {
      axes: [
        { x1: cx - R, y1: cy, x2: cx + R, y2: cy }, // Horizontal (commits <-> issues)
        { x1: cx, y1: cy - R, x2: cx, y2: cy + R }  // Vertical (reviews <-> prs)
      ],
      points: [
        { x: cx, y: cy - R * (this.activityPct.reviews / 100), pct: this.activityPct.reviews, label: 'Code review', labelX: cx-28, labelY: cy - R - 12 },
        { x: cx + R * (this.activityPct.issues / 100), y: cy, pct: this.activityPct.issues, label: 'Issues', labelX: cx + R + 12, labelY: cy + 5 },
        { x: cx, y: cy + R * (this.activityPct.prs / 100), pct: this.activityPct.prs, label: 'Pull requests', labelX: cx-28, labelY: cy + R + 30 },
        { x: cx - R * (this.activityPct.commits / 100), y: cy, pct: this.activityPct.commits, label: 'Commits', labelX: cx - R - 12, labelY: cy + 5 }
      ],
      labels: [
        { text: `${this.activityPct.commits}%`, x: cx - R - 20, y: cy - 10, anchor: 'end' },
        { text: `${this.activityPct.prs}%`, x: cx, y: cy + R + 18, anchor: 'middle' }
      ]
    };
  }

  private buildWeeksGrid(contributions: ContributionDay[]): { days: { date: string; value: number; levelClass: string }[] }[] {
    // Map date to contribution for quick lookup
    const contribMap = new Map<string, ContributionDay>();
    for (const c of contributions) {
      contribMap.set(c.date, c);
    }

    // Find the first Sunday of the selected year
    const startDate = new Date(`${this.currentYear}-01-01`);
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }
    // Build 53 weeks x 7 days
    const weeks = [];
    let date = new Date(startDate);
    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const iso = date.toISOString().slice(0, 10);
        const c = contribMap.get(iso);
        days.push({
          date: iso,
          value: c ? c.value : 0,
          levelClass: this.levelToClass(c ? c.level : 'NONE')
        });
        date.setDate(date.getDate() + 1);
      }
      weeks.push({ days });
    }
    return weeks;
  }

  private levelToClass(level: ContributionDay['level']): string {
    switch (level) {
      case 'NONE': return 'contribution-level-0';
      case 'FIRST_QUARTILE': return 'contribution-level-1';
      case 'SECOND_QUARTILE': return 'contribution-level-2';
      case 'THIRD_QUARTILE': return 'contribution-level-3';
      case 'FOURTH_QUARTILE': return 'contribution-level-4';
      default: return 'contribution-level-0';
    }
  }

  onCustomizePins(event: Event): void {
    event.preventDefault();
    this.router.navigate([`/${this.login}`], {
      queryParams: { tab: 'customize-pins' }
    });
  }
}
