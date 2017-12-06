import { Input, Output, EventEmitter } from '@angular/core';

/**
 * A work around to limitations/bugs of template variables(#) for components in angular 2
 * initial scope: communication between (sibling) components instances
 * example:
 * <component1 [(instance)]="componentInstance1"></component1>
 * <component2 [(instance)]="componentInstance2"></component2>
 */
export abstract class InstantiableComponent {
  @Input() instance: any;
  @Output() instanceChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    let childOnInit = this.constructor.prototype.ngOnInit;

    this.constructor.prototype.ngOnInit = function (): void {
      this.instance = this;
      this.instanceChange.emit(this.instance);
      if (childOnInit) {
        childOnInit.call(this);
      }
    };
  }
}
