import { Directive, ElementRef, Input } from '@angular/core';

let $ = require('jquery');
require('jquery-mousewheel')($);
require('malihu-custom-scrollbar-plugin')($);

@Directive({selector: '[malihuscroll]'})
export class MalihuScrollDirective {

  @Input() triggerScroll: string;
  @Input() scrollTo: string;

  constructor(private el: ElementRef) {
    this.initScroll();
  }

  ngOnChanges(changes: any): void {
    if (changes.triggerScroll) {
      setTimeout(
        () => {
          $(this.el.nativeElement).mCustomScrollbar('scrollTo', this.scrollTo, {scrollEasing: 'easeOut'});
        },
        0
      );
    }
  }

  private initScroll(): void {
    setTimeout(
      () => {
        $(this.el.nativeElement).mCustomScrollbar({
          scrollInertia: 0
        });
      },
      0
    );
  }
}




