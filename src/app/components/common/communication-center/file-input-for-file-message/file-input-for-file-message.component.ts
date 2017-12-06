import { Component, ElementRef, Output, EventEmitter } from '@angular/core';
import { Logger } from 'angular2-logger/core';

@Component({
  selector   : 'file-input-for-file-message',
  templateUrl: './file-input-for-file-message.template.html',
  providers  : [],
})
export class FileInputForFileMessageComponent {

  @Output() fileUploadEvent: EventEmitter<any> = new EventEmitter();
  private nativeInputFileElement: any;

  constructor(private componentElement: ElementRef,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.logger.info('this.componentElement: ',
      this.componentElement);
    this.nativeInputFileElement =
      this.componentElement.nativeElement.querySelector(
        'input[type="file"][name="fileInputForFileMessage"]');
  }

  openFileInputDialog(): void {
    this.nativeInputFileElement.click();
  }

  fileChanged(): void {
    if (this.nativeInputFileElement.value.trim().length === 0) {
      return;
    }
    let file = this.nativeInputFileElement.files[0];
    this.logger.info('file selected', file);
    if (file) {
      this.fileUploadEvent.emit(file);
    }
  }
}
