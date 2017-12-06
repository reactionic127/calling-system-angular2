import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'help-tips',
  templateUrl: './help-tips.component.html',
  styleUrls: ['./help-tips.component.css']
})
export class HelpTipsComponent implements OnInit {
  @Input() tips: any[];
  currentTip: any;
  currentIndex: number = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.currentTip = this.tips[0];
  }

  showNext(): void {
    this.currentIndex++;
    if (this.currentIndex > this.tips.length - 1) {
      this.currentIndex = 0;
    }

    this.currentTip = this.tips[this.currentIndex];
  }
}
