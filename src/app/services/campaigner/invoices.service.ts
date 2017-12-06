import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { Invoice } from '../../models/invoice';
import { Observable } from 'rxjs/Observable';
import { APP_CONFIG } from '../../environment';
import { AuthService } from '../auth/auth.service';
import { Http } from '@angular/http';

@Injectable()
export class InvoicesService extends JSONAPIBase {
  domainModel: any = Invoice;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = '';
  postUrl: string = '';
  deleteUrl: string = '';

  authService: AuthService;

  constructor(datastore: Datastore, http: Http, authService: AuthService) {
    super(datastore, http);
    this.authService = authService;
  }

  getCompanyInvoices(data: any): Promise<any> {
    let url = APP_CONFIG.apiBase + `/companies/${data.company_id}/invoices?filter[fromCreatedDate]=${data.start_date}&filter[toCreatedDate]=${data.end_date}`;

    return this.http.get(url).toPromise()
      .then((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      })
      .catch((response: any): any => {
        return Promise.resolve(JSON.parse(response._body));
      });
  }

  downloadInvoice(data: any): Observable<any> {
    let url = APP_CONFIG.apiBase + `/invoices/${data.invoice_id}.pdf`;

    return Observable.create(observer => {
      let authData = this.authService.currentAuthData && this.authService.currentAuthData.accessToken ? this.authService.currentAuthData : null;
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('access-token', localStorage.getItem('accessToken'));
      xhr.setRequestHeader('client', authData.client);
      xhr.setRequestHeader('expiry', authData.expiry);
      xhr.setRequestHeader('token-type', authData.tokenType);
      xhr.setRequestHeader('uid', authData.uid);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.responseType = 'blob';

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let contentType = 'application/pdf';
            let blob = new Blob([xhr.response], { type: contentType });
            observer.next(blob);
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      }
      xhr.send();
    });
  }
}
