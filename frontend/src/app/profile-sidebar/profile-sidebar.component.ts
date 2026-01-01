import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile-sidebar',
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css']
})
export class ProfileSidebarComponent implements OnInit, OnDestroy {
  profile: any = null;
  loading = false;
  error?: string;
  login = '';
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.username$
      .pipe(takeUntil(this.destroy$))
      .subscribe(username => {
        this.login = username;
        this.fetchProfile();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchProfile() {
    this.loading = true;
    const params = new HttpParams().set('login', this.login);
    this.http.get<{ profile: any }>(`${environment.apiUrl}/api/profile`, { params }).subscribe({
      next: ({ profile }) => { this.profile = profile; this.loading = false; },
      error: (err) => { this.error = err?.message || 'Failed to load profile'; this.loading = false; }
    });
  }
}


