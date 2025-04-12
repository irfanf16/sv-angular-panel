export class CategoriesConfig {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{ label: 'Plan & Packages', url: '' }, { label: 'Products', url: '/categories' }];
  public static readonly COMP_NAME: string = 'Products';
  public static readonly CATEGORY_EDIT: string = 'Product successfully edited';
  public static readonly CATEGORY_HEADER: { [name: string]: string } = {
                                                      "Accept": "application/json",
                                                      "Access-Control-Allow-Origin": '*',
                                                      "Content-Type": "application/json",
                                                    };
  public static readonly CATEGORY_HEADER_POST_M = { ...CategoriesConfig.CATEGORY_HEADER, "Access-Control-Allow-Methods": "POST" };
  public static readonly CATEGORY_DATE_FORMAT:string = 'dd-MM-yyyy';
  public static readonly CATEGORY_TYPE:string = "one_time";

}
