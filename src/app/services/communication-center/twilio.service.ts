import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import { APP_CONFIG } from '../../environment';

@Injectable()
export class TwilioService {
    private twilioUrl: string = APP_CONFIG.twilio.tokenEndpoint;

    constructor(private http: Http) { }

    getUserToken(): Observable<any> {
        return this.http.get(this.twilioUrl)
                        .map(this.getUserTwilioData)
                        .catch(this.handleError);
    }

    private getUserTwilioData(res: Response): any {
        let twilioData = res.json();

        return twilioData || {};
    }

    private handleError(error: Response | any): any {
        let errorMessage: string = 'An error has occured.';
        return Observable.throw(errorMessage);
    }

}
