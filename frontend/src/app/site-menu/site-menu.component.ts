import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { UserService } from '../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Repository {
  name: string;
  owner: string;
  url: string;
  stars: number;
}

@Component({
  selector: 'app-site-menu',
  templateUrl: './site-menu.component.html',
  styleUrls: ['./site-menu.component.css']
})
export class SiteMenuComponent implements OnInit, OnDestroy {
  isOpen = false;
  showFilter = false;
  filterText = '';
  repositories: Repository[] = [];
  filteredRepositories: Repository[] = [];
  displayedRepos = 5;
  private destroy$ = new Subject<void>();

  menuItems = [
    { label: 'Home', route: '/home', icon: 'home' },
    { label: 'Issues', route: '/issues', icon: 'issue' },
    { label: 'Pull requests', route: '/pulls', icon: 'pr' },
    { label: 'Repositories', route: '/repositories', icon: 'repo' },
    { label: 'Projects', route: '/projects', icon: 'project' },
    { label: 'Discussions', route: '/discussions', icon: 'discussion' },
    { label: 'Codespaces', route: '/codespaces', icon: 'codespace' },
    { label: 'Copilot', route: '/copilot', icon: 'copilot' }
  ];

  secondaryItems = [
    { label: 'Explore', route: '/explore', icon: 'explore' },
    { label: 'Marketplace', route: '/marketplace', icon: 'marketplace' },
    { label: 'MCP registry', route: '/mcp', icon: 'mcp' }
  ];

  constructor(
    public menuService: MenuService,
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.menuService.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isOpen = isOpen;
        if (isOpen) {
          setTimeout(() => this.trapFocus(), 100);
          this.loadRepositories();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.menuService.close();
    this.showFilter = false;
    this.filterText = '';
  }

  onBackdropClick(): void {
    this.close();
  }

  navigate(route: string): void {
    if (route === '/home') {
      const currentUsername = this.userService.getUsername();
      this.router.navigate([`/${currentUsername}`]);
    } else {
      this.router.navigate([route]);
    }
    this.close();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    if (this.showFilter) {
      setTimeout(() => {
        const input = document.querySelector('.site-menu-filter') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    } else {
      this.filterText = '';
      this.applyFilter();
    }
  }

  applyFilter(): void {
    if (!this.filterText.trim()) {
      this.filteredRepositories = this.repositories.slice(0, this.displayedRepos);
    } else {
      const search = this.filterText.toLowerCase();
      this.filteredRepositories = this.repositories
        .filter(repo => 
          repo.name.toLowerCase().includes(search) || 
          repo.owner.toLowerCase().includes(search)
        )
        .slice(0, this.displayedRepos);
    }
  }

  showMore(): void {
    this.displayedRepos += 5;
    this.applyFilter();
  }

  private loadRepositories(): void {
    // Try to fetch popular repositories
    this.http.get<any>('http://localhost:3000/api/popular')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.repositories = data.repositories || [];
          this.applyFilter();
        },
        error: () => {
          // Fallback to mock data
          this.repositories = [
            { name: 'github-assignment', owner: 'AyushRauniyar', url: '/AyushRauniyar/github-assignment', stars: 10 },
            { name: 'react', owner: 'facebook', url: '/facebook/react', stars: 200000 },
            { name: 'angular', owner: 'angular', url: '/angular/angular', stars: 85000 },
            { name: 'vue', owner: 'vuejs', url: '/vuejs/vue', stars: 195000 },
            { name: 'typescript', owner: 'microsoft', url: '/microsoft/typescript', stars: 90000 },
            { name: 'vscode', owner: 'microsoft', url: '/microsoft/vscode', stars: 140000 },
            { name: 'node', owner: 'nodejs', url: '/nodejs/node', stars: 95000 }
          ];
          this.applyFilter();
        }
      });
  }

  private trapFocus(): void {
    const menu = document.querySelector('.site-menu') as HTMLElement;
    if (!menu) return;

    const focusableElements = menu.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (firstElement) firstElement.focus();

    menu.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }
}
