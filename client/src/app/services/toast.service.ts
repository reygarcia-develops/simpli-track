import { Injectable, signal, WritableSignal } from '@angular/core';

type ToastType = 'primary' | 'success' | 'warning' | 'error';
interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSignal: WritableSignal<Toast> = signal({message: '', type: 'primary'});
  public readonly toast = this.toastSignal;

  public showToast(message: string, type: ToastType = 'primary'): void {
    this.toastSignal.set({ message, type});
  }
}
