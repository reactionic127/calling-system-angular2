import { Component, Input } from '@angular/core';

@Component({
  selector   : 'context-information',
  templateUrl: './context-information-component.html'
})

/**
 * this component is responsible to display information text
 * accepts as Input:
 * - "defaultContextTitle" - represents the default informational text box title
 * - "defaultContextInfo" - represents the default information to display
 */
export class ContextInformationComponent {
  @Input() defaultContextTitle: string;
  @Input() defaultContextInfo: string;

  private hoveredContextTitle: string;
  private hoveredContextInfo: string;

  constructor() {
  }

  changeContextInfo(title?: string, info?: string): void {
    this.hoveredContextInfo  = info;
    this.hoveredContextTitle = title;
  }
}
