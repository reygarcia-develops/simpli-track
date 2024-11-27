import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, map, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { addAnimationEndListener } from '../common/animation-helper';
import { Apollo, gql } from 'apollo-angular';
import { passwordAsyncValidator } from '../common/validators';
import { RouterModule } from '@angular/router';


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
  

  public fb = inject(FormBuilder);
  private apollo = inject(Apollo);

  public helloResponse: Observable<string> = of('');
  public isPasswordVisible: WritableSignal<boolean> = signal(false);
  public isNewUser: WritableSignal<boolean> = signal(false);

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
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
    const hello = gql `
      query HelloName($name: String!) {
        hello(name: $name)
      }
    `;

    this.helloResponse = this.apollo.watchQuery<any>({
      query: hello,
      variables: {
        name: 'rey'
      },
      notifyOnNetworkStatusChange: true
    }).valueChanges.pipe(map(({data}) => data.hello));

    this.createControlListener('username');
    this.createControlListener('email');
    this.createControlListener('password');
  }

  public registerUser() {
    console.log('Registering user');
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
    const control = this.loginForm.controls[ctrlName];
    if (control.errors && control.touched) {
      this.triggerShrink( this.baseError, el);
    }

  }

  public passwordToggle(event: Event) {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  public getFormControl(controlName: string): FormControl {
    return this.loginForm.controls[controlName] as FormControl
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
