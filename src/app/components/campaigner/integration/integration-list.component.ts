import { Component, OnInit } from '@angular/core';
import { Integration } from '../../../models/integration';


@Component({
    selector: 'integration-list',
    templateUrl: './integration-list.component.html'
})
export class IntegrationListComponent implements OnInit {

    public integrationList: Array<Integration> = [];

    ngOnInit(): void {

        let apiIntegration = new Integration();
        apiIntegration.description = 'This a sample';
        apiIntegration.name = 'Integration name';
        apiIntegration.logoUrl = '/assets/images/api-logo.png';
        apiIntegration.integrationDate = '06172010';
        apiIntegration.isIntegrated = true;

        this.integrationList.push(apiIntegration);
    }

}
