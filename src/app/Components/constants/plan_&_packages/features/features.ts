export class FeaturesConfig {

  public static readonly BREAD_CRUMBS: {label : string,url : string}[] = [{ label: 'Plan & Packages', url: '' }, { label: 'Features', url: '/features' }];
  public static readonly COMP_NAME: string = 'Features';
  public static readonly FEATURE_HEADER: { [name: string]: string } = {
    "Accept": "application/json",
    "Access-Control-Allow-Origin": '*',
    "Content-Type": "application/json",
  };
  // public static readonly FEATURE_HEADER_POST_M = { ...FeaturesConfig.FEATURE_HEADER, "Access-Control-Allow-Methods": "POST" };


}
