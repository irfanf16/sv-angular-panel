export class UsersConfig {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{ label: 'Users', url: '' }];
  public static readonly COMP_NAME: string = 'Users';

  public static readonly Users_HEADER: { [name: string]: string } = {
    "Accept": "application/json",
    "Access-Control-Allow-Origin": '*',
    "Content-Type": "application/json",
  };
  public static readonly Role_AND_Permissions_HEADER_POST_M = { ...UsersConfig.Users_HEADER, "Access-Control-Allow-Methods": "POST" };


}
