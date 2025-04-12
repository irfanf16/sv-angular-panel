export class ClosedAccountsConfig {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{ label: 'closed-accounts', url: '' }];
  public static readonly COMP_NAME: string = 'Closed Accounts';
  public static readonly Closed_Accounts_HEADER_EDIT: string = 'Product successfully edited';
  public static readonly Closed_Accounts_HEADER: { [name: string]: string } = {
    "Accept": "application/json",
    "Access-Control-Allow-Origin": '*',
    "Content-Type": "application/json",
  };
  public static readonly CATEGORY_HEADER_POST_M = { ...ClosedAccountsConfig.Closed_Accounts_HEADER, "Access-Control-Allow-Methods": "POST" };


}
