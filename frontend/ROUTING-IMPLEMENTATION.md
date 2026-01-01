# Dynamic Username Routing Implementation

## Overview
Implemented dynamic URL-based routing to load GitHub profiles based on username in the URL path.

## Features

### 1. URL Routing
- **Default Route**: `http://localhost:4200/` → Redirects to `/AyushRauniyar`
- **Dynamic Route**: `http://localhost:4200/{username}` → Loads that user's profile
- **Examples**:
  - `http://localhost:4200/AyushRauniyar` → Shows AyushRauniyar's profile
  - `http://localhost:4200/torvalds` → Shows torvalds' profile
  - `http://localhost:4200/octocat` → Shows octocat's profile

### 2. Shared Username Management
- Created `UserService` to manage and share username across all components
- All components subscribe to username changes
- All API calls automatically use the current username from the route

### 3. Component Updates
- **Header**: Displays dynamic username from route
- **Profile Main**: Fetches contributions, repos, and activity data for current user
- **Profile Sidebar**: Loads profile information for current user
- All components react to username changes in real-time

## Architecture

### Files Created

#### 1. `src/app/app-routing.module.ts`
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/AyushRauniyar', pathMatch: 'full' },
  { path: ':username', component: ProfileContainerComponent }
];
```
- Defines route configuration
- Default redirect to AyushRauniyar
- Captures username as route parameter

#### 2. `src/app/services/user.service.ts`
```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private usernameSubject = new BehaviorSubject<string>('AyushRauniyar');
  public username$: Observable<string> = this.usernameSubject.asObservable();
  
  setUsername(username: string): void { ... }
  getUsername(): string { ... }
}
```
- Manages current username state
- Provides Observable for reactive updates
- Single source of truth for username

#### 3. `src/app/profile-container/profile-container.component.ts`
```typescript
@Component({
  selector: 'app-profile-container',
  template: `
    <app-profile-tabs></app-profile-tabs>
    <main class="profile-page">
      <div class="profile-container">
        <aside class="profile-sidebar">
          <app-profile-sidebar></app-profile-sidebar>
        </aside>
        <section class="profile-main">
          <app-profile-main></app-profile-main>
        </section>
      </div>
    </main>
  `
})
export class ProfileContainerComponent implements OnInit {
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const username = params['username'];
      if (username) {
        this.userService.setUsername(username);
      }
    });
  }
}
```
- Route handler component
- Extracts username from URL
- Updates UserService with new username
- Contains profile layout

### Files Modified

#### 1. `src/app/app.module.ts`
- Added `AppRoutingModule` import
- Added `ProfileContainerComponent` declaration
- Configured routing for the application

#### 2. `src/app/app.component.html`
```html
<app-header></app-header>
<router-outlet></router-outlet>
```
- Replaced static layout with `<router-outlet>`
- Header remains fixed, content changes based on route

#### 3. `src/app/header/header.component.ts`
```typescript
export class HeaderComponent implements OnInit {
  username$: Observable<string>;
  
  constructor(private userService: UserService) {
    this.username$ = this.userService.username$;
  }
}
```
- Subscribes to username changes
- Displays current username dynamically

#### 4. `src/app/header/header.component.html`
```html
<span class="username">{{ username$ | async }}</span>
```
- Uses async pipe to display username from Observable

#### 5. `src/app/profile-main/profile-main.component.ts`
```typescript
export class ProfileMainComponent implements OnInit, OnDestroy {
  login = '';
  
  ngOnInit(): void {
    this.userService.username$
      .pipe(takeUntil(this.destroy$))
      .subscribe(username => {
        this.login = username;
        this.reloadForYear(this.currentYear);
        this.fetchPinnedRepos();
        this.fetchActivityMix();
      });
  }
}
```
- Subscribes to username changes
- Reloads all data when username changes
- Uses takeUntil for proper cleanup

#### 6. `src/app/profile-sidebar/profile-sidebar.component.ts`
```typescript
export class ProfileSidebarComponent implements OnInit, OnDestroy {
  login = '';
  
  ngOnInit() {
    this.userService.username$
      .pipe(takeUntil(this.destroy$))
      .subscribe(username => {
        this.login = username;
        this.fetchProfile();
      });
  }
}
```
- Subscribes to username changes
- Fetches profile data for current user

#### 7. `src/app/contributions.service.ts`
- Updated API URLs from relative `/api/...` to absolute `http://localhost:3000/api/...`

#### 8. `src/app/services/activity-overview.service.ts`
- Already using full API URLs (no change needed)

#### 9. `src/styles.css`
- Moved `.profile-page`, `.profile-container`, `.profile-sidebar`, `.profile-main` styles from app.component.css
- Made styles global so they work with routing

## Data Flow

```
1. User navigates to http://localhost:4200/torvalds
                    ↓
2. Angular Router matches :username route
                    ↓
3. ProfileContainerComponent extracts "torvalds" from route params
                    ↓
4. ProfileContainerComponent.setUsername("torvalds")
                    ↓
5. UserService.usernameSubject emits "torvalds"
                    ↓
6. All subscribed components receive update:
   - HeaderComponent → Updates displayed username
   - ProfileMainComponent → Fetches contributions, repos, activity for "torvalds"
   - ProfileSidebarComponent → Fetches profile data for "torvalds"
                    ↓
7. All API calls use "torvalds" as the login parameter
                    ↓
8. UI updates with torvalds' GitHub data
```

## Benefits

1. **Shareable URLs**: Each user has a unique URL that can be bookmarked/shared
2. **Clean Architecture**: Single source of truth for username
3. **Reactive Updates**: All components automatically update when route changes
4. **Proper Cleanup**: Uses RxJS takeUntil pattern to prevent memory leaks
5. **Default User**: Root URL redirects to default user (AyushRauniyar)

## Usage

### Navigate to Different Users
```typescript
// In browser:
http://localhost:4200/AyushRauniyar
http://localhost:4200/torvalds
http://localhost:4200/octocat
http://localhost:4200/github

// Programmatically (if needed):
this.router.navigate(['/torvalds']);
```

### Get Current Username in Any Component
```typescript
constructor(private userService: UserService) {}

ngOnInit() {
  // Subscribe to changes
  this.userService.username$.subscribe(username => {
    console.log('Current user:', username);
  });
  
  // Or get current value
  const currentUser = this.userService.getUsername();
}
```

## Testing

1. **Test Default Route**:
   - Visit `http://localhost:4200/`
   - Should redirect to `http://localhost:4200/AyushRauniyar`

2. **Test Different Users**:
   - Visit `http://localhost:4200/torvalds`
   - Header should show "torvalds"
   - All data should be for torvalds' account

3. **Test Route Changes**:
   - Navigate from `/AyushRauniyar` to `/torvalds`
   - All components should update automatically
   - No page refresh required

## Technical Notes

### Memory Management
- All components implement `OnDestroy`
- Use `takeUntil(destroy$)` pattern to unsubscribe
- Prevents memory leaks from dangling subscriptions

### Observable Pattern
- Uses BehaviorSubject for state management
- Always has a current value (default: 'AyushRauniyar')
- New subscribers immediately receive current username

### API Calls
- All services use full `http://localhost:3000/api/...` URLs
- Username passed as query parameter: `?login={username}`
- Backend GraphQL queries use this username

## Future Enhancements

1. **404 Handling**: Show error page if user doesn't exist
2. **Loading States**: Show loading spinner during route transitions
3. **SEO**: Add meta tags based on username
4. **Analytics**: Track which profiles are viewed
5. **Cache**: Cache profile data to reduce API calls
