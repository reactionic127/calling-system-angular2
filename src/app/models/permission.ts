import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';

@JsonApiModelConfig({
  type: 'permissions'
})
export class Permission extends BaseModel {
  @Attribute()
  permissions: any[];
  @Attribute()
  aliased_actions: any[];
}

const PERM_TYPE = {
  create: 'create',
  read  : 'read',
  update: 'update',
  delete: 'delete',
  manage: 'manage'
};

const USER_ROLE = {
  caller    : 'caller',
  campaigner: 'campaigner',
  admin     : 'admin'
};

const USER_ROLE_HOMEPAGE                 = {};
USER_ROLE_HOMEPAGE[USER_ROLE.caller]     = '/dashboard/guidelines';
USER_ROLE_HOMEPAGE[USER_ROLE.campaigner] = '/campaigns';
USER_ROLE_HOMEPAGE[USER_ROLE.admin]      = '/campaigns';

export { PERM_TYPE, USER_ROLE, USER_ROLE_HOMEPAGE };
