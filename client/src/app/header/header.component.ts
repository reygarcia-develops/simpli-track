import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit, output, Renderer2, ViewChild } from '@angular/core';
import { addAnimationEndListener } from '../common/animation-helper';

@Component({
  selector: 'st-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {

  @ViewChild('sun')
  sun: ElementRef | undefined;

  @ViewChild('moon')
  moon: ElementRef | undefined;
  
  public renderer = inject(Renderer2);
  public currentTheme = 'light'

  @ViewChild('headerContainer') headerContainer!: ElementRef;
  ngAfterViewInit(): void {
    this.onWindowScroll();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme); // Apply saved theme
    } else {
      // Default to system preference (media query)
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.setTheme(isDark ? 'dark' : 'light');
    }
    const sunElement = this.sun?.nativeElement;
    const moonElement = this.moon?.nativeElement;

    if (this.currentTheme === 'dark') {
      sunElement.classList.add('animate-down')
    } else {
      moonElement.classList.add('animate-down');
    }

  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    
    const sunElement = this.sun?.nativeElement;
    const moonElement = this.moon?.nativeElement;
    if(newTheme === 'dark') {
      moonElement.classList.add('animate-up');
      addAnimationEndListener(moonElement, 'slideUp', () =>{
        sunElement.classList.remove('animate-up', 'animate-down');
        sunElement.classList.add('animate-down');
      });
    } else {
      sunElement.classList.add('animate-up');
      addAnimationEndListener(sunElement, 'slideUp', () =>{
        moonElement.classList.remove('animate-up', 'animate-down');
        moonElement.classList.add('animate-down');
      });
    }
  }

  private setTheme(theme: string): void {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
  }
  
  @HostListener('window:scroll', [])
  private onWindowScroll(): void {
    console.log('I should add a debounce if this is triggering crazy');
    if (window.scrollY > 0) {
      this.headerContainer.nativeElement.classList.add('scrolled');
    } else {
      this.headerContainer.nativeElement.classList.remove('scrolled');
    }
  }
}
