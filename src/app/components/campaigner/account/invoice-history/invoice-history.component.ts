import { Component, OnInit } from '@angular/core';
import { AuthService, CreditCardsService, InvoicesService } from '../../../../services';

@Component({
  selector   : 'campaigner-invoice-history',
  templateUrl: './invoice-history.component.html'
})
export class CampaignerInvoiceHistoryComponent implements OnInit {

  now: any = new Date;
  ago: any = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
  creditCards = [];
  invoices = [];

  filterData: Object = {
    company_id : '',
    start_date : '',
    end_date   : ''
  };

  constructor(private authService: AuthService,
              private creditCardsService: CreditCardsService,
              private invoicesService: InvoicesService) {
  }

  ngOnInit(): void {
    this.filterData['company_id'] = this.authService.currentUserData.company.id;
    this.filterData['start_date'] = this._formatDate(this.ago);
    this.filterData['end_date'] = this._formatDate(this.now);
    this.getCreditCards();
    // this.getInvoices();
  }

  getCreditCards(): void {
    this.creditCardsService.getCompanyCreditCards(this.filterData)
      .then(response => {
        this.creditCards = response.data;
      })
      .catch(response => {});
  }

  getInvoices(): void {
    this.invoicesService.getCompanyInvoices(this.filterData)
      .then(response => {
        this.invoices = response.data;
      })
      .catch(response => {});
  }

  downloadInvoice(invoice_id: any): void {
    this.invoicesService.downloadInvoice({'invoice_id': invoice_id})
      .subscribe(data => this._downloadFile(data, invoice_id)),
                error => console.log("Error downloading the file."),
                () => console.log('Completed file download.');
  }

  _downloadFile(data, invoice_id){
    let blob = new Blob([(<any>data)], { type: 'application/pdf'});
    let url= window.URL.createObjectURL(blob);
    //window.open(url);
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = invoice_id + ".pdf";
    link.click();
	}

  handleStartDatepickerEvent(event: any): void {
    if (event.type === 'dateChanged') {
      this.filterData['start_date'] = event.data.year + '-' + event.data.month + '-' + event.data.day;
      this.getInvoices();
    }
  }

  handleEndDatepickerEvent(event: any): void {
    if (event.type === 'dateChanged') {
      this.filterData['end_date'] = event.data.year + '-' + event.data.month + '-' + event.data.day;
      this.getInvoices();
    }
  }

  reset(): void {
    this.filterData['company_id'] = this.authService.currentUserData.company.id;
    this.filterData['start_date'] = this._formatDate(this.ago);
    this.filterData['end_date'] = this._formatDate(this.now);
  }

  _formatDate(date: any): string {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) {
    	month = '0' + month;
    }
    if (day.length < 2) {
    	day = '0' + day;
    }

    return [year, month, day].join('-');
	}
}
