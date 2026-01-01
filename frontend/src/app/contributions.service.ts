import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ContributionDay {
  date: string;
  value: number;
  level: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
}

export interface ContributionPayload {
  totalContributions: number;
  contributions: ContributionDay[];
}

@Injectable({ providedIn: 'root' })
export class ContributionsService {
  constructor(private http: HttpClient) {}

  get(login: string, from: string, to: string): Observable<ContributionPayload> {
    const params = new HttpParams()
      .set('login', login)
      .set('from', from)
      .set('to', to);
    return this.http.get<ContributionPayload>(`${environment.apiUrl}/api/contributions`, { params });
  }

  getPinnedRepos(login: string, first: number = 6): Observable<{ repos: any[] }> {
    const params = new HttpParams().set('login', login).set('first', first.toString());
    return this.http.get<{ repos: any[] }>(`${environment.apiUrl}/api/pinned`, { params });
  }
}
