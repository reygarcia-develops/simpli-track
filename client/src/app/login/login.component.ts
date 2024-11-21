import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { addAnimationEndListener } from '../common/animation-helper';
import { Apollo, gql } from 'apollo-angular';
import { passwordAsyncValidator } from '../common/validators';


@Component({
  selector: 'st-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit{
  @ViewChild('usernameGroup') 
  usernameGroup: ElementRef | undefined;
  @ViewChild('emailGroup') 
  emailGroup: ElementRef | undefined;
  @ViewChild('passwordGroup') 
  passwordGroup: ElementRef | undefined;
  
  public fb = inject(FormBuilder);
  private apollo = inject(Apollo);

  public helloResponse: Observable<string> = of('');
  public hidePassword: WritableSignal<boolean> = signal(true);

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
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
  }

  public loginUser() {
    console.log('Logging in');
  }

  public onFocusOrBlur(ctrlName: string) {
    const el =  ctrlName === 'password' ? this.passwordGroup?.nativeElement :
                ctrlName === 'email' ? this.emailGroup?.nativeElement :
                ctrlName === 'username' ? this.usernameGroup?.nativeElement : null;
    
    if (!el) {
      return;
    }
    const control = this.loginForm.controls[ctrlName];
    const showError = control.errors && control.touched;
    const valid =  this.loginForm.controls[ctrlName].valid;
    const animationColor = showError ? '#ED6A6A' : valid ? '#6BCB77' : '#6495ed';
    const currentColor = getComputedStyle(el).getPropertyValue('--animation-color').trim();

    if (animationColor !== currentColor){
      this.triggerShrink(animationColor, el);
    }
  }

  public passwordToggle(event: Event) {
    event.preventDefault(); // Prevents the form submission
    this.hidePassword.set(!this.hidePassword());
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
  triggerShrink(color: string, element: HTMLElement) {
  
    // Start shrink animation
    element.classList.add('animate-shrink');
  
    // Listen for the end of shrink animation
    addAnimationEndListener(element, 'shrink', () => {
      // Update the animation color since it shrunk the first color
      this.updateAnimationColor(element, color);

      console.log('Shrink animation completed. Removing');
      element.classList.remove('animate-shrink');
  
      // Start expand animation
      console.log('Starting expand animation');
      element.classList.add('animate-expand');
  
      // Listen for the end of expand animation
      addAnimationEndListener(element, 'expand', () => {
        console.log('Expand animation completed. Removing');
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
}
