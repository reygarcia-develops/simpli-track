import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

type ToastType = 'primary' | 'success' | 'warning' | 'error';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<{
    message: string;
    type: ToastType;
  }>({message: '', type: 'primary'});

  toast$ = this.toastSubject.asObservable();

  public showToast(message: string, type: ToastType = 'primary'): void {
    this.toastSubject.next({ message, type});
  }
}
