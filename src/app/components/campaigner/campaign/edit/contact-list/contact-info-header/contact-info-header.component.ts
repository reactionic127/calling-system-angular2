import { Component, OnInit, OnChanges, Output, EventEmitter, Input } from '@angular/core';
import { CONTACT_LIST_TABS } from '../contact-list.component';

@Component({
  selector: 'contact-info-header',
  templateUrl: './contact-info-header.component.html'
})
export class ContactInfoHeaderComponent implements OnInit, OnChanges {
  @Input() openTab: CONTACT_LIST_TABS;
  @Output() chgOpenTab: EventEmitter<any> = new EventEmitter();
  tabs: any = CONTACT_LIST_TABS;


  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
  }

  setOpenTab(tab: string): void {
    this.chgOpenTab.emit(tab);
  }

}
