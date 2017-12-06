import { Directive, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService } from '../../services/translate/translate.service';
import { NgModel } from '@angular/forms';

let $ = require('jquery');
require('../../../../node_modules/select2/dist/js/select2.min');


@Directive({
  selector: '[upcall-select2]',
  providers: [NgModel]
})
export class UpcallSelect2Directive {

  @Input() placeholder: string;
  @Output() upcallSelect2Change: EventEmitter<any> = new EventEmitter();

  constructor(private el: ElementRef, private translateService: TranslateService, private ngModel: NgModel) {
    this.initSelect();
  }

  ngOnChanges(changes: any): void {
  }

  private initSelect(): void {
    setTimeout(
      () => {
        $(this.el.nativeElement).select2({
          placeholder: this.placeholder || this.translateService.translate('Select')
        });


        $(this.el.nativeElement).on('change', (select2ChangeEvent) => {
          /* Inform ng model for any new change happened */
          this.ngModel.update.emit(select2ChangeEvent.target.value);
          this.upcallSelect2Change.emit(select2ChangeEvent);
        });

        /* Listening to the value of ngModel */
        this.ngModel.control.valueChanges.subscribe((value) => {
            /* Set any value of your custom control */
            $(this.el.nativeElement).val(value).trigger('change.select2');
        });

        // TODO use following if works ok with listening also for control valueChanges
        // /*  Listening to the value of ngModel */
        // this.ngModel.valueChanges.subscribe((value) => {
        //     /* Set any value of your custom control */
        //     $(this.el.nativeElement).val(value).trigger('change.select2');
        // });

      },
      0
    );

  }
}




