import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Observable, of, debounceTime, map, catchError } from "rxjs";

  /**
  * Async validator to check if the password matches the required format.
  *
  * This validator checks if the value entered in the password field matches a certain regex pattern. 
  * The password must:
  * - Contain at least one lowercase letter.
  * - Contain at least one uppercase letter.
  * - Contain at least one number.
  * - Contain at least one special character (e.g., !, @, #, etc.).
  *
  * @param control The form control to validate.
  * @returns An observable that emits either validation errors or null indicating the validation result.
  */
  export function passwordAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    return of(control.value).pipe(
      debounceTime(300),
      map(value => {
        if (!passwordPattern.test(value)) {
          return { 'passwordInvalid': true };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }