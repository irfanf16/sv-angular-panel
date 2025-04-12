import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLimitText]'
})
export class LimitTextDirective implements OnInit {
  @Input() limit: number = 0;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const element: HTMLElement = this.elementRef.nativeElement;
    const text = element.innerText;
    if (text.length > this.limit) {
      element.innerText = text.substring(0, this.limit) + '...';
    }
  }
}
