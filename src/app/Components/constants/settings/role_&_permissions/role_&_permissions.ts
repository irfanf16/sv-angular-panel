export class RoleAndPermissionsConfig {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{ label: 'Roles & Permissions', url: '' }];
  public static readonly COMP_NAME: string = 'Roles & Permissions';

  public static readonly Role_AND_Permissions_HEADER: { [name: string]: string } = {
                                                      "Accept": "application/json",
                                                      "Access-Control-Allow-Origin": '*',
                                                      "Content-Type": "application/json",
                                                    };
  public static readonly Role_AND_Permissions_HEADER_POST_M = { ...RoleAndPermissionsConfig.Role_AND_Permissions_HEADER, "Access-Control-Allow-Methods": "POST" };


}
