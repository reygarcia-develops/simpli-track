import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UnauthenticatedGuard } from './guards/unauthenticated.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

export const routes: Routes = [
  {path: 'login', title: 'Login', component: LoginComponent, canActivate: [AuthenticatedGuard]},
  {path: 'register', title: 'Register', component: RegisterComponent, canActivate: [AuthenticatedGuard]},
  {path: 'dashboard', title: 'Dashboard', component: DashboardComponent, canActivate: [UnauthenticatedGuard]},
  {path: '', redirectTo: '/login', pathMatch: 'full'}
];
