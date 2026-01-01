import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderModule } from './header/header.module';
import { ProfileTabsModule } from './profile-tabs/profile-tabs.module';
import { ProfileSidebarModule } from './profile-sidebar/profile-sidebar.module';
import { ProfileMainModule } from './profile-main/profile-main.module';
import { ProfileContainerComponent } from './profile-container/profile-container.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { SiteMenuComponent } from './site-menu/site-menu.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [AppComponent, ProfileContainerComponent, MaintenanceComponent, SiteMenuComponent, FooterComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    HeaderModule,
    ProfileTabsModule,
    ProfileSidebarModule,
    ProfileMainModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
