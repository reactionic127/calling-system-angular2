import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { USER_ROLE } from '../../../models';
import { PermissionGuard, CanDeactivateCallService } from '../../../services';
import * as Cmp from '../../';

const appRoutes: Routes = [
    {
        path: 'myCampaigns',
        component: Cmp.MyCampaignsHomeComponent,
        canActivate: [PermissionGuard],
        data: {
            pageName: 'myCampaigns-home',
            isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
        },
        children: [
            {
                path: 'join',
                component: Cmp.JoinCampaignComponent,
                data: {
                    pageName: 'join-campaign',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]

                }
            },
            {
                path: ':id',
                data: {
                    pageName: 'caller-campaign-detail',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                },
                children: [
                    {
                        path: '',
                        component: Cmp.CampaignInformationComponent,
                        data: {
                            pageName: 'campaign-detail',
                            isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]
                        },
                    },
                    {
                        path: 'information',
                        component: Cmp.CampaignInformationComponent,
                        data: {
                            pageName: 'campaign-information',
                            isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]

                        }
                    },
                    {
                        path: 'call',
                        component: Cmp.CampaignCallComponent,
                        canDeactivate: [CanDeactivateCallService],
                        data: {
                            pageName: 'campaign-call',
                            isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]

                        }
                    },
                ]
            },
            {
                path: '',
                component: Cmp.MyCampaignsMainComponent,
                data: {
                    pageName: 'myCampaigns-main',
                    isAllowedRole: [USER_ROLE.admin, USER_ROLE.caller]

                }
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class MyCampaignsRoutingModule { }
