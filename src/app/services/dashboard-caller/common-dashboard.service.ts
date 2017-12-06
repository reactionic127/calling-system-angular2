import { Injectable } from '@angular/core';

@Injectable()
export class CommonDashboardService {

    tips: any = [{
        id: 1,
        value: 'Tip 1 of the day - Find out more on how you can increase your conversion with UpCall!'
    }, {
        id: 2,
        value: 'Tip 2 of the day - Find out more on how you can increase your conversion with UpCall!'
    }, {
        id: 3,
        value: 'Tip 3 of the day - Find out more on how you can increase your conversion with UpCall!'
    }];

    getTipsOfTheDay(): any[] {
        return this.tips;
    }

    // tslint:disable-next-line:typedef
    getOrdinalOfDate(d: number) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    getCurrentDateTime(): any {
        let objToday = new Date(),
            weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
            dayOfWeek = weekday[objToday.getDay()],
            months = new Array(
                'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
            ),
            curMonth = months[objToday.getMonth()],
            curDate = objToday.getDate(),
            curHour = objToday.getHours() < 10 ? '0' + objToday.getHours() : objToday.getHours(),
            curMinute = objToday.getMinutes() < 10 ? '0' + objToday.getMinutes() : objToday.getMinutes();

        let currentDateTime = {
            hours: curHour,
            minutes: curMinute,
            day: dayOfWeek,
            month: curMonth,
            date: curDate,
            ender: this.getOrdinalOfDate(objToday.getDate())
        };
        return currentDateTime;
    }
}

