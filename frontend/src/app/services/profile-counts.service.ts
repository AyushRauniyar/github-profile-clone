import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfileCounts {
  repoCount: number;
  projectCount: number;
  packageCount: number;
  starCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileCountsService {
  private apiUrl = `${environment.apiUrl}/api/profile-counts`;

  constructor(private http: HttpClient) {}

  getProfileCounts(login: string): Observable<ProfileCounts> {
    return this.http.get<ProfileCounts>(this.apiUrl, {
      params: { login }
    });
  }
}
