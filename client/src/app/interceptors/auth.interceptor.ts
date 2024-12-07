import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedReq).pipe(
    map((event) => {  
      return event;
    }),
    catchError((err) => {
      // TODO Server will throw a 500 in the instance the token is expired 
      const unauthorized: boolean = err?.error?.errors?.[0]?.extensions?.code === 'UNAUTHORIZED';
      if(err.status === 500 && unauthorized) {
        authService.clearToken();
        console.log(authService.getToken());
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
