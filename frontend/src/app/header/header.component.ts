import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MenuService } from '../services/menu.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  dropdownOpen = false;
  copilotDropdownOpen = false;
  username$: Observable<string>;
  currentUsername = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private menuService: MenuService
  ) {
    this.username$ = this.userService.username$;
  }

  ngOnInit(): void {
    this.userService.username$.subscribe(username => {
      this.currentUsername = username;
    });
  }

  navigateToMaintenance(event: Event, feature: string): void {
    event.preventDefault();
    this.dropdownOpen = false;
    this.copilotDropdownOpen = false;
    if (this.currentUsername) {
      this.router.navigate([`/${this.currentUsername}`], {
        queryParams: { tab: feature }
      });
    }
  }

  onMenuClick(): void {
    this.menuService.toggle();
  }

  navigateToProfile() {
    if (this.currentUsername) {
      this.router.navigate([`/${this.currentUsername}`]);
    }
  }
}
