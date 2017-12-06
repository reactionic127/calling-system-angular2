import { Directive, ElementRef, Input } from '@angular/core';
import { Logger } from 'angular2-logger/core';

let $         = require('jquery');
require('../../../../node_modules/jquery.inputmask/dist/jquery.inputmask.bundle.js');
(window as any).Inputmask.extendDefinitions({
  p: {  // masksymbol p to accept + and numbers
    validator   : '[\+0-9]?',
    cardinality : 1,
    prevalidator: null
  }
});

@Directive({
  selector: '[upcallInputMask]'
})
export class UpcallInputMaskDirective {

  @Input() maskPattern: string;
  @Input() maskRegex: string;

  public mask: any = null;

  constructor(private el: ElementRef, private logger: Logger) {
  }

  ngOnInit(): void {
    try {
      // renderer.setElementStyle(el.nativeElement, 'backgroundColor', 'yellow');

      let showMaskOnHover      = true;
      let showMaskOnFocus      = true;
      let clearMaskOnLostFocus = false;

      if (this.maskPattern === 'regex') {
        $(this.el.nativeElement).inputmask(
          'Regex',
          {
            'regex'               : this.maskRegex,
            'showMaskOnHover'     : showMaskOnHover,
            'showMaskOnFocus'     : showMaskOnFocus,
            'clearMaskOnLostFocus': clearMaskOnLostFocus
          }
        );
      } else {
        $(this.el.nativeElement).inputmask({
          'mask'                : this.maskPattern,
          'showMaskOnHover'     : showMaskOnHover,
          'showMaskOnFocus'     : showMaskOnFocus,
          'clearMaskOnLostFocus': clearMaskOnLostFocus,
          'greedy'              : false,
          'allowPlus'           : true
        });
      }

      this.el.nativeElement.addEventListener('keyup', (keypressEvent) => {
        keypressEvent.stopPropagation();

        let unmaskedValue                   = $(this.el.nativeElement).inputmask('unmaskedvalue');
        this.el.nativeElement.unmaskedValue = unmaskedValue;
      });


    } catch (error) {
      this.logger.info('mask error: ', error);
    }
  }

  // ngOnChanges(changes: any): void {
  // }
}




