export class TalkToSalesConfig {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{ label: 'Talk to Sales', url: '' }];
  public static readonly COMP_NAME: string = 'Talk to Sales';
  public static readonly CATEGORY_EDIT: string = 'Product successfully edited';
  public static readonly TALK_TO_SALES_HEADER: { [name: string]: string } = {
                                                      "Accept": "application/json",
                                                      "Access-Control-Allow-Origin": '*',
                                                      "Content-Type": "application/json",
                                                    };
  public static readonly CATEGORY_HEADER_POST_M = { ...TalkToSalesConfig.TALK_TO_SALES_HEADER, "Access-Control-Allow-Methods": "POST" };


}
