// import {DataInfo} from "./models/iauth-info/data-info/data-info";

export interface DataInfo {
  superuser?: boolean,
  expiration?:number | null,
  name?: string,
  token?: string,
  permissions?: any,
  image?: string
}
export default interface IAuthInfo {

  success?: boolean,
  data?: DataInfo,
  message?: string


}

// export default class iAuthInfo {
// }
