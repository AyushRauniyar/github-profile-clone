import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSubject = new BehaviorSubject<string>('AyushRauniyar');
  public username$: Observable<string> = this.usernameSubject.asObservable();

  constructor() {}

  setUsername(username: string): void {
    this.usernameSubject.next(username);
  }

  getUsername(): string {
    return this.usernameSubject.value;
  }
}
