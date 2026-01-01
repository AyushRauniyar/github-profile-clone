import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActivityMixResponse {
  totals: {
    commits: number;
    issues: number;
    prs: number;
    reviews: number;
  };
  percentages: {
    commits: number;
    issues: number;
    prs: number;
    reviews: number;
  };
}

export interface RepoContribution {
  nameWithOwner: string;
  url: string;
}

export interface ActivityReposResponse {
  top: RepoContribution[];
  extraCount: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityOverviewService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getActivityMix(login: string, from: string, to: string): Observable<ActivityMixResponse> {
    const url = `${this.apiUrl}/activity-mix?login=${encodeURIComponent(login)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    return this.http.get<ActivityMixResponse>(url);
  }

  getActivityRepos(login: string, from: string, to: string): Observable<ActivityReposResponse> {
    const url = `${this.apiUrl}/activity-contribs?login=${encodeURIComponent(login)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    return this.http.get<ActivityReposResponse>(url);
  }
}
