import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();
  private previousActiveElement: HTMLElement | null = null;

  open() {
    this.isOpenSubject.next(true);
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.lockBodyScroll();
  }

  close() {
    this.isOpenSubject.next(false);
    this.unlockBodyScroll();
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  toggle() {
    if (this.isOpenSubject.value) {
      this.close();
    } else {
      this.open();
    }
  }

  private lockBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll() {
    document.body.style.overflow = '';
  }
}
