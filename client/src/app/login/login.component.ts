import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { addAnimationEndListener } from '../common/animation-helper';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../common/toast/toast.service';


@Component({
  selector: 'st-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit{

  @ViewChild('emailGroup') 
  emailGroup: ElementRef | undefined;

  @ViewChild('passwordGroup') 
  passwordGroup: ElementRef | undefined;
  

  public fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public helloResponse: Observable<string> = of('');
  public isPasswordVisible: WritableSignal<boolean> = signal(false);
  public isNewUser: WritableSignal<boolean> = signal(false);

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    password: [
      '',
      [ 
        Validators.required,
      ],
    ],
  });

  private baseError = getComputedStyle(document.documentElement).getPropertyValue('--base-error');
  private basePrimary = getComputedStyle(document.documentElement).getPropertyValue('--base-primary');
  private baseSuccess = getComputedStyle(document.documentElement).getPropertyValue('--base-success');
  private baseWarning = getComputedStyle(document.documentElement).getPropertyValue('--base-warning');

  ngOnInit(): void {
    this.createControlListener('email');
    this.createControlListener('password');
  }

  public loginUser(): void {
    if(!this.loginForm.valid) {
      return;
    }
    this.authService.login(
      this.loginForm.controls['email'].value, 
      this.loginForm.controls['password'].value
    )
    .subscribe({
      next: (result) => {
        // Handle successful login
        const loginResponse = result.data?.loginUser;
        if (!loginResponse) {
          this.toastService.showToast('Failed to login', 'error');
          return;
        }

        this.authService.storeToken(loginResponse.token);
        this.router.navigate(['/dashboard']);
      },
      error: (unexpectedEror) => {
        this.toastService.showToast('Failed to login', 'error');
      },
    });
  }

  public onFocus(ctrlName: string) {
    const el =  ctrlName === 'password' ? this.passwordGroup?.nativeElement :
    ctrlName === 'email' ? this.emailGroup?.nativeElement : null;

    if (!el) {
      return;
    }
    const control = this.getFormControl(ctrlName);
    if (control.untouched) {
      this.triggerShrink(this.basePrimary, el);
    }
  }

  public onBlur(ctrlName: string) {
    const el =  ctrlName === 'password' ? this.passwordGroup?.nativeElement :
                ctrlName === 'email' ? this.emailGroup?.nativeElement : null

    if (!el) {
      return;
    }
    const control = this.loginForm.controls[ctrlName];
    if (control.errors && control.touched) {
      this.triggerShrink( this.baseError, el);
    }

  }

  public getFormControl(controlName: string): FormControl {
    return this.loginForm.controls[controlName] as FormControl
  }

  public passwordToggle(event: Event) {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }


  /**
   * Triggers the shrink animation on the input element and transitions to the expand animation
   * once the shrink animation finishes.
   *
   * Also updates the `--animation-color` CSS variable to the specified color.
   *
   * @param color - The color to set for the animation (e.g., 'blue', 'red').
  */
  private triggerShrink(color: string, element: HTMLElement): void {
  
    // Start shrink animation
    element.classList.add('animate-shrink');
  
    // Listen for the end of shrink animation
    addAnimationEndListener(element, 'shrink', () => {
      // Update the animation color since it shrunk the first color
      this.updateAnimationColor(element, color);

      // Shrink animation completed. Removing
      element.classList.remove('animate-shrink');
  
      // Start expand animation
      element.classList.add('animate-expand');
  
      // Listen for the end of expand animation
      addAnimationEndListener(element, 'expand', () => {
        // Expand animation completed. Removing
        element.classList.remove('animate-expand');
      });
    });
  }

  /**
   * Updates the value of the `--animation-color` CSS variable for the given element.
   *
   * @param element - The HTML element to update the CSS variable on.
   * @param color - The new color value to set for the `--animation-color` variable.
 */
  private updateAnimationColor(element: HTMLElement, color: string) {
    element.style.setProperty('--animation-color', color); // Update CSS variable
  }

  private createControlListener(ctrlName: string): void {
    this.loginForm.get(ctrlName)?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      const el =  ctrlName === 'password' ? this.passwordGroup?.nativeElement :
      ctrlName === 'email' ? this.emailGroup?.nativeElement : null

      if (!el) {
        return;
      }
      const control = this.getFormControl(ctrlName);
      const animationColor: string =  control.valid ? this.baseSuccess : this.baseWarning;
      const currentColor = getComputedStyle(el).getPropertyValue('--animation-color').trim();
      if (animationColor !== currentColor) {
        this.triggerShrink(animationColor, el)
      }
    });
  }
}
