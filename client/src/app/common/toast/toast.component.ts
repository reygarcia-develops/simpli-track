import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { ToastService } from './toast.service';
import { CommonModule } from '@angular/common';
import { addAnimationEndListener } from '../animation-helper';

@Component({
  selector: 'st-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent {
  @ViewChild('toast') toast: ElementRef | undefined;

  private toastService = inject(ToastService);
  public readonly toastSignal = this.toastService.toast;

  constructor() {
    effect(() => {
      
      const element = this.toast?.nativeElement;
      if (this.toastSignal()?.message && element) {
        element.classList.remove('fade-out');
        element.classList.add('fade-in', 'shrink');

        addAnimationEndListener(element, 'shrink', () => {
          element.classList.remove('fade-in', 'shrink');
          element.classList.add('fade-out');
        });
      }
    });
  }
}
