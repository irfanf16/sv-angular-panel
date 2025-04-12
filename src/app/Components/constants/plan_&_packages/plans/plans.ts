export class PlansConfiguration {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{label: 'Plan & Packages', url: ''}, {
    label: 'Plans',
    url: '/plans-packages'
  }];
  public static readonly COMP_NAME: string = 'Plans';
  public static readonly PLAN_HEADER: { [name: string]: string } = {
    "Accept": "application/json",
    "Access-Control-Allow-Origin": '*',
    "Content-Type": "application/json",
  };

}
