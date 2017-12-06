import { Directive, ElementRef, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Logger } from 'angular2-logger/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Directive({
  selector: '[upGridSort]'
})

export class UpcallGridSortDirective {
  @Input('upGridSort') upcallGridSortStore: any;
  @Input() upDataSrc: Array<any>;
  @Input() upSortCfg: any;
  @Output() onSortRequested: EventEmitter<any> = new EventEmitter();

  crtColumnDefaultSortConfig: any = {
    field: null,
    isDate: false,
    isDefaultSort: false
  };

  crtColumnSortConfig: any = _.clone(this.crtColumnDefaultSortConfig);

  subscriptionSortHappened: any = null;

  constructor(
    private el: ElementRef,
    private logger: Logger) {
  }

  ngOnChanges(changes: any): void {
    if (!this.upcallGridSortStore.sc) {
      this.upcallGridSortStore.sc = {
        field: null,
        sortDir: null,
        dataSource: this.upDataSrc,
        sortHappened: new EventEmitter()
      };
    }

    this.crtColumnSortConfig = Object.assign(this.crtColumnSortConfig, JSON.parse(this.upSortCfg));
    if (changes.upDataSrc && changes.upDataSrc.currentValue) {
      this.upcallGridSortStore.sc.dataSource = changes.upDataSrc.currentValue;
      if (this.crtColumnSortConfig.isDefaultSort) {
        this.sortByCurrentColumn();
      }
    }
    this.setLook();
  }

  ngOnInit(): void {
    this.el.nativeElement.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault();

      this.sortByCurrentColumn();
    });
    this.subscriptionSortHappened = this.upcallGridSortStore.sc.sortHappened.subscribe(
      (data: any) => {
        this.setLook();
      },
      (error) => {
        this.logger.error('Sort Error: ', error);
      },
      () => {
        // subs.unsubscribe();
      }
    );

  }

  ngOnDestroy(): void {
    if (this.subscriptionSortHappened) {
      this.subscriptionSortHappened.unsubscribe();
    }
  }


  sortByCurrentColumn(): void {
    if (!this.upcallGridSortStore.sc.dataSource) {
      return;
    }

    if (!this.upcallGridSortStore.sc.sortDir && this.crtColumnSortConfig.defaultSortDir) {
      this.upcallGridSortStore.sc.sortDir = this.crtColumnSortConfig.defaultSortDir;
    } else if (
      (this.upcallGridSortStore.sc.field && this.crtColumnSortConfig.field !== this.upcallGridSortStore.sc.field)
      ||
      (!this.upcallGridSortStore.sc.sortDir)
      ||
      (this.upcallGridSortStore.sc.sortDir === 'desc')
    ) {
      this.upcallGridSortStore.sc.sortDir = 'asc';
    } else if (this.upcallGridSortStore.sc.sortDir === 'asc') {
      this.upcallGridSortStore.sc.sortDir = 'desc';
    }

    this.upcallGridSortStore.sc = Object.assign(this.upcallGridSortStore.sc, this.crtColumnSortConfig);
    let sortDir = this.upcallGridSortStore.sc.sortDir;
    let field = this.upcallGridSortStore.sc.field;
    this.onSortRequested.emit({ sortDir: sortDir, field: field });
    this.sortDataSource();
  }

  sortDataSource(): void {
    if (!this.upcallGridSortStore.sc.dataSource) {
      return;
    }

    let sortDir = this.upcallGridSortStore.sc.sortDir;
    let field = this.upcallGridSortStore.sc.field;

    this.upcallGridSortStore.sc.dataSource.sort((item1, item2) => {

      let fieldVal1 = item1[field];
      let fieldVal2 = item2[field];

      if (this.upcallGridSortStore.sc.isDate) {
        fieldVal1 = moment(fieldVal1).valueOf();
        fieldVal2 = moment(fieldVal2).valueOf();
      }

      if (sortDir === 'asc') {
        if (fieldVal1 > fieldVal2) {
          return 1;
        } else if (fieldVal1 < fieldVal2) {
          return -1;
        } else {
          return 0;
        }
      } else if (sortDir === 'desc') {
        if (fieldVal1 > fieldVal2) {
          return -1;
        } else if (fieldVal1 < fieldVal2) {
          return 1;
        } else {
          return 0;
        }
      }
    });

    this.upcallGridSortStore.sc.sortHappened.emit({ sortDir: sortDir, field: field });
  }

  setLook(): void {
    let sortDir = this.upcallGridSortStore.sc.sortDir;

    if (this.crtColumnSortConfig.field !== this.upcallGridSortStore.sc.field) {
      this.el.nativeElement.setAttribute('class', 'custom-caret-double');
      return;
    }

    if (sortDir === 'asc') {
      this.el.nativeElement.setAttribute('class', 'custom-caret-up');
    } else if (sortDir === 'desc') {
      this.el.nativeElement.setAttribute('class', 'custom-caret-down');
    }
  }
}
