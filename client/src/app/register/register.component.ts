import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, map, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { addAnimationEndListener } from '../common/animation-helper';
import { passwordAsyncValidator } from '../common/validators';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../common/toast/toast.service';


@Component({
  selector: 'st-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit{
  @ViewChild('usernameGroup') 
  usernameGroup: ElementRef | undefined;

  @ViewChild('emailGroup') 
  emailGroup: ElementRef | undefined;

  @ViewChild('passwordGroup') 
  passwordGroup: ElementRef | undefined;
  

  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public helloResponse: Observable<string> = of('');
  public isPasswordVisible: WritableSignal<boolean> = signal(false);
  public isNewUser: WritableSignal<boolean> = signal(false);

  public registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    password: [
      '',
      [ 
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(50)
      ],
      [passwordAsyncValidator]
    ],
  });

  private baseError = getComputedStyle(document.documentElement).getPropertyValue('--base-error');
  private basePrimary = getComputedStyle(document.documentElement).getPropertyValue('--base-primary');
  private baseSuccess = getComputedStyle(document.documentElement).getPropertyValue('--base-success');
  private baseWarning = getComputedStyle(document.documentElement).getPropertyValue('--base-warning');

  ngOnInit(): void {
    this.createControlListener('username');
    this.createControlListener('email');
    this.createControlListener('password');
  }

  public registerUser(): void {
    if(!this.registerForm.valid) {
      return;
    } 
    this.authService.register(
      this.registerForm.controls['username'].value,
      this.registerForm.controls['email'].value,
      this.registerForm.controls['password'].value
    ).subscribe({
      next: (result) => {
        const registerResponse = result.data?.registerUser;
        if(!registerResponse) {
          this.toastService.showToast('Failed to register', 'error');
          return;
        }
        this.authService.storeToken(registerResponse.token);
        this.router.navigate(['/home']);
        this.toastService.showToast('Sucessfully registered', 'success');
      },
      error: () => {
        this.toastService.showToast('Failed to register', 'error');
      }
    })
  }

  public onFocus(ctrlName: string) {
    const el =  ctrlName === 'password' ? this.passwordGroup?.nativeElement :
    ctrlName === 'email' ? this.emailGroup?.nativeElement :
    ctrlName === 'username' ? this.usernameGroup?.nativeElement : null;

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
                ctrlName === 'email' ? this.emailGroup?.nativeElement :
                ctrlName === 'username' ? this.usernameGroup?.nativeElement : null;
    if (!el) {
      return;
    }
    const control = this.registerForm.controls[ctrlName];
    if (control.errors && control.touched) {
      this.triggerShrink( this.baseError, el);
    }

  }

  public passwordToggle(_: Event) {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  public getFormControl(controlName: string): FormControl {
    return this.registerForm.controls[controlName] as FormControl
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
    this.registerForm.get(ctrlName)?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      const el =  ctrlName === 'password' ? this.passwordGroup?.nativeElement :
      ctrlName === 'email' ? this.emailGroup?.nativeElement :
      ctrlName === 'username' ? this.usernameGroup?.nativeElement : null;

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
