import { Input, Output, ElementRef, EventEmitter, OnDestroy, Directive, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';

@Directive({
  selector: '[debounceInput]',
})
export class DebounceInputDirective implements OnInit, OnDestroy {
  @Input() delay: number                     = 300;
  @Output() valueEvent: EventEmitter<string> = new EventEmitter();

  private eventStreamSubs: Subscription;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    const eventStream = Observable.fromEvent(this.elementRef.nativeElement, 'keyup')
      .map((term: string) => this.elementRef.nativeElement.value)
      .debounceTime(this.delay)
      .distinctUntilChanged();

    this.eventStreamSubs = eventStream.subscribe(input => this.valueEvent.emit(input));
  }

  ngOnDestroy(): void {
    if (this.eventStreamSubs) {
      this.eventStreamSubs.unsubscribe();
    }
  }
}
