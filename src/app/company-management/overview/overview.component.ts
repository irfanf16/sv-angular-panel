import {ChangeDetectorRef, Component, ElementRef} from '@angular/core';

import {Chart, registerables} from "chart.js";
import { HttpHeaders } from "@angular/common/http";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {environment} from "../../../environments/environments";
import {DataSharingService} from "../../services/data-sharing.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import Swal from 'sweetalert2'
import {BreadcrumbService} from "../../services/breadcrumb.service";

import {CategoriesConfig} from "../../Components/constants/plan_&_packages/categories/categories";
import {PlansConfiguration} from "../../Components/constants/plan_&_packages/plans/plans";
import {checkPermission, notEmpty} from "../../util";
import {moduleIds} from "../../Components/project_resources/modules";


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', './invite-form-popup.css']
})

export class OverviewComponent {

  baseURL: string = environment.apiBASEURL;
  showSpinner:boolean = false;

  activeCompanies:number[] = [];
  activeCompaniesLength:number = 0;
  users: any[] = [];
  invitedCompaniesLength: number = 0;
  inActiveCompaniesLength:number = 0;
  noOfUsersChart:any;

  companyPlans: any[] = [];
  // @ts-ignore
  public createCompanyForm: FormGroup;
  showErrors: boolean = false;
  submitted: boolean = false;
  inviteOwnerModel: boolean = false;
  createCompanyResult: any;
  showCompanySpinner: boolean = false;
  inviteOwnerButton: boolean = false;
  ownerHasInvited: boolean = false;
  inviteOwnerButtonDisable: boolean = false;
  hideInvitationFieldsInFormation: boolean = false;
  showCompanyForm:boolean = false;
  categories: any[] = [];
  planFrequencyPrices: any[] = [];

  constructor(private httpClientRequest: HttpClientRequestService,
              private formBuilder: FormBuilder, private encryptDecrypt: EncryptDecryptService,
               private dataSharingService: DataSharingService, private breadcrumbService: BreadcrumbService,
              private elementRef: ElementRef, private cdr: ChangeDetectorRef
  ) {

    this.dataSharingService.callFunctionEvent.subscribe(() => {
      this.getCompanies();
    });
 // console.log(this.encryptDecrypt.decrypt("eyJpdiI6IjJ1M2hDckFtb3dYYmM4dUZqd3FDWmc9PSIsInZhbHVlIjoiRU1jTGk1Yzg2dDhFekw3VE5GZmZjbHVsSUdRUHFmM1hRTHBwSlpQWVFrbDJrYmdsUWV1VmVYd2NUbit2Z3I5SURhZVRwaEFOVUhYQ2Y0WjBvdU9uRmo1TmxvUTVwUXR5MUNCZEoyZmY1U0s5VCthSmpXdTJFQUZvY0RSbjhVR3RRN25rUlpZQS95MFd4KzRweTZtcHVqbnI3cDR3citwYXFoQnhxQlo0Vk9sVElkWTBnZlpCcW9lbUF4WC8ybXlQYlRoSWU3c1RQVFg4SGl3T2U5K2ZONGlBM1V4ZTFDdUdrM0o5cUY0cXQwbFF6VXowOUVoc1J0QUlSUUZxS3N3OFBSSTJpTW45N1JZTlNuVTJScFdXWTVYejB3d2dWUDdVK05sQ3N2bTJWM1JmRjFTZzJpRkdzeXI0QVUrMTl5UWpNTVNudjdsKzF6Qm52ditKVnRDSzBvVDYrRjBqZnVsMVlpNnhiUGJXY1VnRENodDRtM28rbnhvd01LK0M5VEVBSVZpN2pybjBldy9uSnFOQUV5NzQvNnNqbTQya1ZPN0JsMUVOcHFTdUVJbk9zd1JMVWxPazZpZ1JKaEtBWHZlQWcwR1JIc2dodHhFajYrQ01yeHgzV0tMVW5VeWllbE40ODRNb0V0TGZkSjFrUjcrcHluaU9EY2NXVU1zUVR6V0xmSlVCdUtEWjh2bGl5SkNKNmpsdXJMTGc1c291K2gzcDFPMUg1eVJGcGRxMjhNOWpqZ0VBdENINWJoNThoL1g1UUZ5NWNxdWRGV2tPa1hkYWZxa0hVOU8vVkVORnlxZjZ1OHh0LzJ3aXFTclB3U3k2SXpFKzJ5S281SXh6eVhXVGcxTlh5QkQyalhsWnZPMWU4cXlwdXpZbkt3SW5iSnY3V3NJNTV4U0VkU2Zic2l6VUVrQmhPZ0NBZnVpdHdWZ2pBYkVWbWN2YVEwK1NXTE92bWYyVkxNVE42dnpHUkxadFdseTFidU4wSEN3dzRmOEFCaVErRkFLdjN0elB4L29TNDlla09lbitDcmxRUmxyRlZuL3FWTTA5N3NwRDIvaTJ2ZnpSREVwYnJ4Wm5MWms3Y3NFNTBPMVNyZFdSY2YwYnVBUEIwaHVycjYxQ1ZTQVZWc2Jla2dvMEZKNWVtc1FDTEp5dnZheDg1eG9EMDRsVWZNeFdyNTgyUnYycURkNUNHMGVhRHAwNDcrYk1GVHlaMXNidXRNb3g1WThwdE03cEd2alBLcG1uYlowL0ZpdVdKQlR3QlcvZW5kVW1DSXNrYm5QSm5CMUFaZ0FNOEJQdGx3RHc1MXlTZDh1b3h3cG9jYnBXaUVJVUR6UHNVSVBGUmpvUGZlb244OGcxNSt4VFcyMVBtMEwxOVEyTzhrOGhhajZwRHBaMFN5MHYrNGYxMFl4b3dKZHZ5bmx4S0NKWFlQVWdBRkNNMkxjY1RDMUFGSERFMTJZczd4OWZvaXJjQk1TRGdnQmhZM0RuWjF4UmFKL2FqRkI3aVp6UVZRZXFJeC9VRlZkQ1FmN0x1RG1ZQXE3QVJQcmt6ZnZtYWNkRjlzL1BqRXNiNUJuMmUrVW85c1BWSlFQYnNaY25tYlNpUVVuQU9WdU1qUE92WFJuUWFUSHNpWGszNGdVc0kwK2Eyc1hBT2FTbHBHbHlpalhaWGJiYjhzd2lsNk9iQnRhQTJUbzNyT1c4OE5HV0Z2aHhqVzRRNFpRU0g4S01HMDg3UW4xeUlJVWNacVRXazFyYWZlMnE4Uk40dytySnFtOFM5MmJjVkNNWUl2Z2d0VXNlTzhweW5YaGhQRWZhb0JyWHI3V3VNdEZjN2gzY1NwVUc4VWgvY0xicVUycnZvcUlEMU9Sc2h5cEZndHFYc2tnaDdXRjh2aGsxWUt5OFVsNE5HbmkyelJvYkVScUtuTkd6dXNuYllMMkJlRFNqVFNYWlhtN2JhR0ZlYUxPRUhSeHV0MHpoYnVHT0FySEtUdmd1U3dwSzlJWGc1YjJTd1RrR1ZZUGZwejR5ZWZ1bUFVQlRTNjV0Z3l5MmRUd0MyNjlmZlBXZEF0SlEzUjZwQ2M0T0wwbE1qY25ERkF5VGZQNWI0UGZjWEYvT2VsYy9jRUFCenpsNDZraTVvOGtaOWhyNmhXcFNlWVYvV1BKMHkzQmRGaDFXT2JZUEhsUVRSV1ZqSmorS0Rjclh1WVlabVpOVTFHM3plWmtHbEtaMGQvekVBdGRLMUdWWXdwSWhKRVN4ZlkvakJpMXRmd2RsVTVzbTlPbHZVWFZpYTVKbnZIMDVkZXhkV1ROUzBQSFErRjc1QWlSR1djSFh0dWU5QkR2d1g5UThIWWNGTnZmN053aXhHZEVaTncrSEFFMHV2cmhIeUp4Q2h4c3VKbEZ5VnoyeTRQaU5Da2RBSFROMllyVmJ5QnhHYUxTTjBnN2t5MkxoaHpUNksxZFBLWmJaSGRPQUQxVHkxSm8wVncrVUMrSVE0N001ckRZV1g4YmhUQm1HMFBqZFpRMVZwMXJoRjU5NVE5b0RLYVQ5VU5RSkVwRkszRDgvRUNaU3gzOEVTYUEvRlNtbUZtVHlYcXlBUUZ3NHJKUm80RS9jY1hvT0JNZ0Z2NjZ2YTQ3WElhVDRIRDNjdTRncy91UHljWnBudlVNMDBjRi9PeitNbURFMVZ5KzBBcTN4Z2lSMTUzdHpxeTcvQVdUQlArYUxta1lRUkxNWFJXNVQ3M044TjRzekRncnAvOTVnUXc3akM2V3NBTmZYVzJhdEswRUpYTkU0dktxa255bmJHYjRmQk5uaW1GRWZiWVBMTTQrN0pTbWtHRWtGRU9VT2hwU1BhWkJDOVkvTnRSN1c1M1hGUWxFTmZGc2NsQTZ6aFpwSkd4aUNGVU9XMlRjRUFRU2x1dkNOQi8wMzVERXhrOWlNZENoZnZhc0pqWlFxNkQvcDU4czA3VWxPK3U0Q2dtMVdSWmtheGVzTG9obDFtN2lwclg5dzNjNU1SOS9nKzZhUnBFdFo5eVdNdVpkZ2pPTHQzT3Izbjl4dVRZVVpLbTNpMndSVXhYcGk0Z2Fpc25sM0ViKzJ5Mk5SdlNvN3N3dGJhZFBXUWUwRk1qeWQvWTFMUEdOY3RQSGpKekRwN1RsUTh1cU5PaWpzMHhaQ0NqZ0JpSlR5RlRCY1JEdFd0a1pVZFVmQW1yL2UvV2NmZ2FxU0t4YTBOWTBWNU5IT2U4V21HTGltM2NsSTIxcUh3OEZyZTgzT2RRbzRHVVNGSHVzS041N0QyZHBMZnlmOGxaNU56eVE3Z1NuZEpWdjMyL2xWb3JwUEg5TUx5T3k2bFBnMCt0ZER5b21pa2svOXoydW4rcjZ6Z0lZeFpkeEQ4VXdEMWQ5RklFYkFzUFFVRUYvdU96UUZ2Wnk2TnBRam8wdis2b2ZIVU5mSmpxczVoaWxvTWYyb2tBeldCb2paMnVFeTk3L0NpWVcvS0lLc3VDMkJIYlhPRHBQZkJkOVFDYWRJRUFrSmpzWHoweDdzREoydk11cmJ4bk1JUGIrQzA3MEhNcGhJNHBkMVN1VzlrckJvcHo0UXdUUitFbFJDMVRvRDFnVUJCOWV5VmlGSXkzWHh6Ym55YTdqVTlra1BVVjhaR0UvZnUyWWtENzNYR0c5SjhxSXFSQXA2V29meURkUHBCQjR0S1V0TVRzK0doUFczS0dJbFdGNC9tT3NnWExrOGU1bHJqQnF1T3o1N3ovcGZ3aWRBRU1YZ2NIb3p1M0xVZ2hIOHZFMzR4NkZDbjQwcFNTR0FhaktLVWtJNEVTSDhJSDN2OVRCS2JCNmFtSllzWGcyUVRseXM1UjU2MXJuSFNPVDhOT3VSY2pZSGtuUVdPSWV2TVllYWs1UzJRYisxeklMYUlRNFFHdExISFJIK3A4YUM2TmpIYzdaUUFyZS9aWkhSSU80NHNMalZXWm83elA5aFZOOXRTN0l2VlV2L01qWkhiLytBcmFFVzd2ZVJRajBIM0p2a0Ixd1YyYjkySUZEdGt6S0x5QUJNWG95ODNiSFY1WTF4NWVYQUx4ZXdBMkFKdUt4NXlOTXRONFFxc2RncS8rM01mbjZOSnBnSi9YU2R6cHgvSUdSNitlNWcwWlkxcFc0T0lOM2g1K3lhZk5McVZocHN1bk5tMlpjeXRnSDhQTmp0MEZNelhXemp2amE0eUN5MDVFSTQ3ajVJVzdHbzNhS3ZmemlXQ3ZHY3lIZGExMDd4ZEhHckxlWWU5TEFrTEhNdGFUWXNVdkRsU211KzBOc0RjQ1FLcVVmU0xqQk5nQjRHWWwwclBtbzFxRmZwOFhBZ3N3aENBTHkveS9GdDBNbjN2NWQvWVJ5WldTdzJXT2hHOU1Zb1V5R1J3dmpmNEszVnI2bWZFZ1paS2FzRVlWTUxMVVJIOG5LaENJWEFTalprNWlsM2NXY0NManFhQ2hZcGhUbmN1T0sxZ05yTHJKK01kcFRYQW5UQXVPVVQ2Z3NLNHZsaTQyckQ2NlRDUFpMTEQ0eEJKN05zbk1qcGY1YWYwOUpUSE9FaUMzL3dqbFcyQzNJa2JqN0NvUnk0emc2cWxoMEhiRUJjSW5tQjVQK1JtWWZRRVY2QzIxMGNFK2VaMlZka0xXa0FrdGQ3SituWEg2L3ZmMzMxSGRNaDBsQlJaSFlVbjZTZy8vZVV3NmFtRDBCUWQ2cUFvNzdMc0IraFJaa1BuNG5yemh6aHd3ckdUd1p1MkFZcWxFd0RnSUpzYkpSRFAxTVlaSFlBY2lFYzlhMk5PS2MxckdDbVV4THorOHlIRXdzRTZjaGJFTkZITkYreXQ1ZWlMVzdjTmVXUXVEc1hCeTBhWVBwbVpMT3JoRCt4V2RYR3R3S2xRRHBPUjVBYW55Tm9MZDFoN1l0QUlGMzVqWE8zK1NOanByTGVNdEw0R0k4WW9qa2YxRFhKSURtS3drTW5jSFU0a3NpNlZXVzVuUnZwdjJyZnN4QmJrNUE5d080UG92S0c0MTZYMW5pblVRd3laQ3dFd09tQ2FGNWUxbkVSOXlRVCs0dExqbXQrdllFN2g3RG56UGRCTVArNzF5a3NiK05STXdWazN6cnp5WWtjNWJ6U1B0ZnVwWmtmL1ZwUjdoUEY4WXB4czJEME5MalBvbkNMYUxFUWs5ZG9xMHUwTER1Z0Y2NFJKL3ZhNzFMZnhXdFYvd1hKVU1XWG1MSWVNY0dDZVZpei9sUjlETVFVTmVtMTVRWG5HNXh2aGV6M3Z5UDk2blR3eTdEeFhxUW1YSm1MZkEvNFQrRlVlMTB2aFlXcTZaR3c5dUhPOHZaTGhTM0wvNUNUZ0VIMHdSNk9nd0FLdE9xaG9pTW9iOXhvazNpemY0Q1lIWmlPU042b0dDM3FsdFU1dHhNaGlNMWU1VEJZajZPTFJlVXgvRVR4a1Fxcm0yN1pSc1lLeU9BVHQyMkUvNUw0UnpKVmEwbHhrNmlnWUVodjRaeXp2U3k0VFh4aG0weWtJL3pWQkRORmQxVkRDRUJhclRlYlF0QmE2dUdKQldIc0R4ejhiZ0dQc01ZM0dVUmJkM2J3d0oyMkVKTUdIZUUzREhybkxxVmJHVk1DbmFlTU1lRFJnSi9LRUhSOVBFdVVJL2lyTmNwNlNGZk43djg5VDJiQ2NoeUlMRk16Tmk2TVpKNGlvN2pPSEZoNlZMWkptRnR2a25ydHI5YzZOTkhuRE1KM3hkN3NHa2FaN3FONjhOV1RBMnhoL3l4VkdYWmhwUVpvT296WktubnVoZVF2TkRxOXNrbGZHdE04WG9SOUwyRUh6bElILzVYTllFLzhJYUt3ZjRDcytmYTZabGJkWERJNlB0Umd3SWQwOGFzZFZRSkFkQXNpcWdwYW1DN3Fyelp2K2JjeVd2eUlXZ2UrRWV3bXNHTCtZQnA1cGlDZlNJL05maUFBbFpXMGlWaWtCUlZlRkNEYVhwU3Rjakh2SmZHMm1IdDQ3SU5zd3dkZVhnb25IS3Y3Y3o2ci9DekNxR3JGTnM2TVFwaUdkOEpLZVhrVlRDV3lDREJIUEplbkdULzhnYVJ6YUYzRm5GZG5iQXhyWWlvOCs5QVpnNm5pd2tLU0Q2M1NqWk5BdTRmWmZwdm83SUNzQkhhSGNKVHdhTGQzV2pvcVNxbnBUVlNmcG92aElCUmFKWVVQajFNQmY5VXZLUDJGd2VyRWZFNlhYYVJyZm5FbGlyYW8yTC95T0FBclBBUXhDaG5JeDA5aitOT0ErWGVZMHZLdG1MNjJmSDVHaGhkY21BUnNRMHZ1YmdRMnBsSEw3TjhJcENqczlycDJOMzJzSDFaelR0RGQ1eWRvTkFiZ3A5MDFuUEp1VzFPdFdWb2F3UE4zK0VQYmplbjFlMDZHclBydXF0OVpGRjRLdmRNQUwwbEJUS1E1ZkhlQ2hlTlZqWitZNnhwUkVwR281WndFdW03WjlqWVoxaTFXUEpYbDZ5dXVtampObzNHbnZmVWZJNXlxSDlQM0Z6a2FIRGRqUWRmWk00YlFiZDcvZGZRdkNTcmhRVTJOY1VXL0NKalAxUmY4SlNwQjR5bnFZZXRkNHlLRGpEK21TZ2kwVUVDQjJRVlN2ZzFjTXRNNWJoOHc1QkVSaXNVN25YaFB4c0FQY1lZR3Y0QWFpQzNKaVowdi91MnRkQnJocUFJREM5VUxBK0tTV2dnN3gzQVNxREdhZCtaWk5HN0xEeE1yK1FlYXZHOTB0Y1N1SWdIaTlGNnpaalVTLy9yNlAyVjNsU3UxTkxOTkRTYUpic2hzMTBPblkxZmhhQXcyVnp1dzk0OXlaZ3pNRGg1TnFsUTd1eFZpamw1bkxBM21CRms1WmVSeTQ3L3FuODkyNnh1VXZpbmNVNDc5ZkRTVDRUTGFhSzdvOFFRek1DQkRQV00xMXc5Q253M1dYNHdpQVhzc3IvdDRmcXV4b1F0cTgvOWcvbjhWbGFKNzJFWFBHMEhzRWFHYVhaVnFOamRGQzQxZHNyNXg3bDk4T3ZwTmtuYVZxazc2eW13SHpoT0hpcDA0MU9WbCtVTjcxSHh6anhSZEVtWVlrYnhsYVQvaTNOeURBNlUzaW1vZDlFNit3MmhreHVsTUVYRk0zanBMS3FnQlVrZFk5OE8wN2FyT1ZuMzFkcnpqbjc0c3RvVzI1WFp1b2MzUUhiLzBpQS9zcGRhVGNWL3Fjbi9Na2k2YmNlNGQwLzZBb2dmYkU5Vmw1NzJoNmdEM2dqWWQ4SHFvZFZOcXd3ckk5ZDFTM3l2Qy9NZW1QdEtpZ082b0NVV0NmOVozMTFSRFZTM0xNdmtQOVc3dTRTNzhIcGcxNEN2ekVwT0RpNUhRejFpb1JzSGRFUnUyZUFSV0NzTnB4bHpZZk1OQXlhQ0pPOFg4TjNyRjB4YXdqZC9MNElNcU1FWFlNVmF1TUY3T2R4RDZhSzdrb3dYYjZwTFBGT0VRUjdtakJJdmdKN1lCMU9oY1dYMUpDMXJHU3I3dCtRSEV3SDBzQUtKdXZrU1VRRWhqN2NKbjduZEVqREEvMmdDSzVydFJLbGwzcndPbWVQNW5kVUNZcXhzSlRXKzFvMDVmampMNkRNY0RFdHBuSStWVmx1ZG56UHhKUDkxWVU3bXZKRzk1SU5BOXNpdytZVnZZRlE3Y1VEMENaeW1udGVJeHNnbzJOaTA4amNwMGpzd25nLzRZMmdXQmJVUWc4RVVIS1U2NUhzSDJuZ2hOazJRMGUzZmdjY3dValdpeDY5MkE3NU4xVTd2d2c4cGRZK29ZSHpHTGtUMkErdU43cy9JRDhGV25nR3dKVHJENE5lWVVGOFRXWStjV2pNeWQ0aXQyNVdzajRlUjllTWxNWHdUN3ZKTXdNMUgxMy90Ny9lZGE1Z2RkTUtzODN0eVdEVEtnSUxjbEJHT3JYbWNneENKb2dRSkpEcW5ZRnlzVnUzZmxHa2VPU2M3bDkxUGxTVVFSRkV6U29XTlFjblh4dURzMlFIdytNZ2ZUeFAyNEhmMkJ4N2l0bjd1cy80aDlhM3FsUzFqTGxHc0Z6RGo3TmhId0s4Z0lWYzcyVHB2YjhtNHQyc1hCNGNWcnEvQWh0UjNwdlhvelE3SU5oR2F5M2Z0UGdCK1FQWHkxK0NxaDhDRDArcUVDdlpBT3h3YU5JVHpqN1pQYWEyaktwMCt5bHlTTndsbFJ4bm1jYkFhMGMzSmMwcmNPTkJMaWV0MEVUQ09KMkpFcFhNS1cvS2J5cHplbThsN3R4TXFNVXdZTWxITHRSMEIvZ1Vic2NUd3dNYXNsZ1pzMkcvL2NNSGhKeVF2TlY4MjJvbllaSzUzWEtWUzVFaWI3RlErSjJmQjYzMmVrOGpRSnNBdmRQQm92NEgwR2JRMlVjNTN6QjdSejJYKzRCU2c5dzVsL3h1WTU1NW9INks4WDNVYjgwVjRjaVVpbnMwdFdYV2RKNzVoSUt2Y200TGVLUGRCZUJrcU1SK2RVcjZ1QVkxZ3lNMmlPUFJtbnlxQTNORDZLZDJJZGt3SW9XcHVWOCtIYjFhWEdFMVA1UXZHdG5iR05VbXRmMSt6MWVEMjk5dTJJYXBtc3E5bkowZUdQajFNZEJQV1RBZU0vM0lYNXJ3MlY0cis1M09iS3B3ZHhHT01wNkVOa0h0c3RUVktuSHhGRGpzMVhQWGFRbjJ3RUsxNDI1OVhvNWhKdjdTV1FKSUZyRVlVcXU4eVd5a3pGLzZUcnR2T0dyc3dOVkJaWHp3S1kycmFoMmZ3RnIwZ0ZQOS9PaXpKLzY1ZEh5SDk0RG11NTJwaFE5Z1poUGF0V3BhQUVTWEZCblFUTFk3eGVjMnVJMzg3dEFQdWlJQjE1Tk9uMHRzek04SFFwTUZxd2FFWmhrUHpjRHlReURaSWJGeVBoWWhvTGdEVTZwZXhZdkZNVUl6NWF1S0ZOQUZoZzU4QkFVaCtod0dJUFdvOGh5cUppNEpoSUhCd0tlSHhMbTRvNjBGSzdzTWtlVVNTTHVrTWk4TUc4aFNmWEh2Tk9xZUxaaVhuU2JBOVBzY2lyYUo4eW80dllONjAzbnRUcE5UZGJoeHU0K1JIY2l5T3UydkQrbS9vQWN2dVYyZkphaXlnMjI3NWlvOW85T0xrb0FMWG5hVjYrSGVFYndzcjhXT0lSSDVvaC84Sk9GLzFtMEh6RFcvOU1DWGR5anViODVmb2thdVI4T2lhdVhvdW1Ka2Q0RU1oWUhnM0hQMXl4dWlBdlVzQUt6ODM1M21vaWxxZnQvZ3B4UWt2eDBTcjFVeUhyT1ZndHloRDJjdnZMYS9teW5TNlFtTzhUUTFFcTFFZksyUVhlS2NRWVVjTjc3NHN4cWw4WEN4MDZWb29DMmZmQkdBQmd5cW43dUlxTTQ4WVIrYnZ4dnF0UmV0Qi9ySkJOaER4SWdJa3l4YWI5NnUvTXBTY20xZi82TzQ0ckNwRFQraU1aZDBrSTVKenl3TXpNV3M3VTFoQWpXYjVBb0RpUXY2eE9Zd2loVGpTak1yYm81WlpOaXRDZkxpNWVQeUlvS3JRbGIrbmJXd1RRQTNTTkpWdEMzaTREdVJxN3JRVWxGU2I4MlEvM2pnUWNwSXF2cVF0YytLR0lQRi9jaGJpRFN0bmFocFdNVkQ1bGRtaThhZ0pBK3VJYU5DR0ZBTUFVUnpsOU92YXZpdXdkN3AybXRyb3dydXgzSU1PWFZPbWVzaHlYR2RJZTFnYllmbTJkWnRxdm9PR2g4WUFUMHE4alNpdnNaU0R1eUVKczVjOXJ2UnF5alhrK01BYndQYWJ4RUVMMDNwU0hyUGlVYnFwQWtLOTc2bk1kV2hyaHE0YXJmRGxWMmRQTkRnOW91dFV5bURCc01nSlpRZk9yZ0hyVXUvY1ROZUIvbDhMcmRKcXhWSnN6Y3JDRk53a1p0Q0pXNERIdjU4L25lT245TTBPS0lpMnpHTFY2QktRcHFocHFmT1E5TkZveUZidk5iME1xWnNhNHpkTkRWTElhSFVQdyt4Y2dWTXNOc21pYkplRzl1NUVNYXp2UnVGQmhxRHNVckU3a2k5c2dqMzZOWXlieHk0WHlNeFo5SGtodVZxdlJ6ei9mLzI2YityODZlVkw4UDljT0pjMWNQaG1pekgxWUhEVTM2UDlrczEwMXpBaGpIRldVdE4wSEw4dloxeE1MR0owbG9vOU1NRGJoR3dFM0lLQ0VEWnNWMGltbjF5bkJUenh5NWNlaUl2cEEyRmZOK21aYXpEejFMSld3dUYyRXZOdnQzSllvWlVRd0J2UnptN2JINFdIZ0p1M3Jla3F5TFBXbmpHckJmeU1nRXZqczBhRU95d3ZSMlZBSmR3cm1jbWxGZFl5OUw5Q25nZGs5aElxNEsreHBpdkdmbXlHRlpaVGhHaVdhY0J6VWdqWkdDcHlLQ1hKWGphTHRnbit6c0JtNnA5RHdwK29zY3RMSTMvdWRDSlVWRER0c0ZjTjd3aVNGaGpjeDFvT240QWhtcWNMUEt1SnZUTUxVWWpWWkhGeXZpdUl2SXR0dldxQzBmekV1QVdMeVhCRFYwUDZUSWtQam82YjR3U251SzZXWEx2ZDhYaGpPOXZJSWtOK1g2S3E3U3JaZ3k1WGh6dk5ydE1WYmxaZHpaay9TOW1RN05Bb2h5RFIzaUlzUzdVVEIwL2xDNmQ0VEJaSXBkWTV2WHZDTVREdVpTOHVSTlVlWmEyM2lPNkxYL2VGaEc0aGFaUzhUN05oSUFFditKcXNxOVZ5aFQvSWMvYVlMbHVSRlg0eW9ZMThqNWlGcC9LNGRGSjhzS0JGL2crbGpiMVhrUk9qMll5cEJMSXIyd3ZaVTRiY1Z0VjFsc2l5L1psS0JRSFhJaTJNelBxNVpDNVJXZm1XUUs5d3Q4UUR5dHgxbTQ3Yy9vWlJ3NGgvZnVOcjZ1WXFQREs2dDVvdHprZUY3eFNGNjM1R0ZCbUZiUWhSTXJmT0FSdzh6V2dDOTJUYnJxU2F5SHVkMDQyU2RjcU8rL3VWVU5SUStrSlFxSUg0R2podWcrc1JSeVZ5enAwOTlNT01QNzBGMTNWQ0lIK0kxS0puOFNjTS9VNkRRa0ZlWjNOeGFzakxMNXZhQXRBM0g5bFRLWWhYRExFWmE3eGpzc1YxWWlmN3RqaEZQelhTbnZHdnNtU0FmSW9Mai9odWtkY0pQZ1pRS29ta3h4VjZqNUlMSVJIYnU3NzN2RDBKcXBVRGVxVkh6NHRpdmtEeFFWSWtQL2Q5Q1kvSUdaQ1dDQW95WEpMZUw0WWNSVnE2eE1DdVFLZllPNEo3SjFmb2R4LzBPdGYzVDN4NkJCTm5ZaUo3ZW5EbmN3TWY2S2xLVy9KRldwcUFSV2RaZWFScVc3QW9oL2tMZzcrNkhqTGNMSExkSE1VTEd0TjduODFhL3pieHVZdUY0UWIwZzlKekFOT1h0WDNpdjZwYnJWaGh5dnpSWWFYVjFBTGhHNE1aSmp1MEFHaXkyS2pHU0kreENxTnc4bU5zb3BoS3F1dTF3VUIraHFHL0Y1UnVQdm5TWFo2Qml3RGc1ekUrdi9xWHhlMG8rMDE2aG1Kc0FXamsxSHI2dUhKYkx1MEJsM0RORWtjbUlmZElHRlFzVHA4c2VPbkF6OHJlOWJCL0Y0NkRxZldSZGNEMVI4bTVoMjZsb2RQNlQySE9rQm8xNDhaQ2xzMFI0T20yVWNDSDdPby93azdwQithRWtiSVFrYklicE92ZUlSOWZMMFQ2S01mVVBxRXlrSTRmUmZ3cWx2Q1pqejdYaGxwUGwwRUtwL05STm5xSVF2c0NKOW9jSzcwbHk0YjNiajVLaVVwVDA3SkZYaHZqN3JKZnpMUE9uTTRoZ091RkRBTER5N1o2a2h2Wkt2ancxQTRqSndiaEpUaENwTGhJaDRWUnFMTWVWcys5cno5dVZpaEdWWVQ0aEhRaGN2OHJlWDZJNUNWSGFQcmozUENPRmlzUG9EdVlaRVd1OThMVTZDVkxJQWNsZlJsaW0rSGxaQm1XdUtpekIzWGRBcUJGSWx1cS9CUFNON2xvNDlTQlVQSVVCTUJpeGxJODFyYXJaSnZ6c2hBekk1RXFSWFRaNTRWVnNOQ2ZRSXBacXRnUHY1bkRPZ2FJN0pOYlBFaUlLcVdBclliY1E5U3M2MEtGMVQ4S0EveGdoeEY0eVYzM2J2TzNwWm9yd0owdUNNVHZLVmgzUU5CeVhKQ0dCTFM0SjFRVytqR3ppVU9IcXVOeGpSRGVGc3hVSWtJTHU5MndrS2U4dGd6ditQZlhOOFpTUVU5azJjcXYwbVRBRjA0T05JOTFqbG1EeTg0RDkzeWlDUHUvTzJkSDVKMHhXMWFrRU8rWnJ4OGRoZVpJTU1hNUJaR3ZnaHkwZzBidmVBcmdmeUg1ZHV1YW5lK3pNaXFMeDluM0ptYXBOTnZBclpYZFczNHZ0cGhmMENkRWhwU1ZHSmo4d0ZzVHpzWDBaVEVRSWlUWFdrNmFmV2FtZEoxcFVWS0cwelcvT0IvOHJHekFlVFFubE1kZFV0YXhOQ1dWYmxHU0o0SWFrTnVWS2VpWHpuU2tRR1g1UXpybmpEcUVvaGdjUEJBcWxKMytjWk0wM2wxMkRUVng1Y0NZa3RzK3BPb3A0emRQVTROZzVTbFVsQ0Y0b1RZZVRLVE00S2ZwbmYwWnhHdDg1YWFnVHVxZXJyWnNhQ0RIN2NDNU1tWVJtTldNTWxRWE0yUVNXbTdrdU41UmZ6aUdCZ3BxNUplOUZsU1NHOG42aG1WYm9pRVlhNjhPUHdnVDRydFR6RWRLSGRPVGQ3bXc5ZU9HODRsS0gyb1o2RzV3MXQ4MjZEbk82a2N5V0Jzbzh5OXBubGR4a1kzb3V6NTZPcDVsamU4aVdZY2tNdXhmSklGREtYOVFIN0hmR3BrRUN6a2Y4ZENvbERBK2RBM05Hb1VoSzZhQ0l6clZTNkdCZjlnRm1SVkhFcWNHNm9qRi9LR0lrYm1CUjJ2V2ZEQ2ZDREtYY2N6d1FjeG9wV28zMitUWTFsckdRNlpZK2pzbEZaWXBOdWtrNDRvSUtvWjNPT1ZXV2ZRVnhjM0RXQjltclhCNXlLSmVjcTRoSmdhWVhGZG1GaHI1YmZCcHhtTDk5aExtYUhvTUhxNDBPeWlVdkZXelF4OTMwZ2JEQzdvSUpBYXBxUWpOSzJTa1MrVUlDUUZTeEQyTjVibXdqZUNKK3pLNFJjZmRDanhuNzI2WmdZdTd4bGIxTEk1UkU1eEVQSS9xTnZ3cG92M3Z1WGc2MnBxZmJmVllWdlN4Szg5WWNzMXBVOHNUbFlmaDk3VGhKeTV2OXIzWm5UbDZ0eEV3dWZVRGpDRVNOVGJ2Rlc0RGIvMmN4dE5sUkMwZk9uVytWRkJSWEhSTGJHVGNwU0FSVDNSZjlPOFBCOFRTVGVHRE0yWVBrRERnMFEzUnVBNk80ZUNSb0pLem84WDBDS2c2MmxqZjRQNVlIT01mSGNQRzhVR1p2SmNHL0ZKTjFISTNsaHJsVGdma0Q4RFF1L1lXcVhzSndVU3V4aVhRdEp2ZDY5M3dkODNXb1VZSW02S2d0MlV0NmExYkhDaUM1ZlBhMzJWQ3FBb1dSbXJBcWthSnM0NHlEYlc2elRPc093em54dkpmUWlCR1pWdDRyWk5mMEJhMEpuQ2ZWSzdtWFRuUWl3WG01bjVObHdrcmJaSXo5em9icXFMaVhQZHVlR2hHZ2RXYzQyWmJOd2FGc2N1ZFhrNjVMRGZIdGpscjNnV3BvaWVGVGxGcGRoczFPaHRULzdiNExKMnBtb1R5andrRGh3MVFWNDJ3Sk5DSUNVZW1nY0pET0pURGdBNDI5WHovMW11MnRZayt0R204ZmtwSmMwQ0NEUVk1Rkx4MHJqQmNvcUN3UEhTMzRQT2VaV2sxMnkrMGJzVUx4Y1JlOXBoaks1UnVTNXEwZ0lWYWFCajNJK1lqUE5yVEtkeDE5KytzSjh2ZTA0dzNEdEZKc25ZbGd2WE9FWlZFVzlrVTJRUEtQY1dMZGpsMkVCQW9pd1U2RWxsZ2ROYUcyWkM0RG1OSmE0eEh3Tk42OGt6Ukt5R1c1VmM4SHl2RFNQYkRodkIvTFhyd2NyREhrSm5vbkM4dFZUZzR0dUFlcllYVGFZSkRqRFBTYnNLZytvbnJJQmNTSENSRFN0MmRwdi9jdHhrcGxLTWRMcUEwWUwyWUt0NDIydEp3TUJqbU91enR2c09EbkpBbmVjancyNURnUnlmQnVNSVgra2kzZE5CZGVIajRmK0VIeUQ1S214WS9CZW5ia1FLYU5EUEZuSmtPbGRJTDFWUXBROUdUOFdwOUNWbHhaMFpWWWo0dlVLMkY2TmVzUUxVbW4yK3VpaG05UnpMQXhMUE9nMDQxeExoZlFNSFUvK0RCUkJDZmZKWmUyNjQzTnYyV2hWV09qN0JLVmVuNzJ4KzVZY3hzbWhpYXlTeHVIeUJUVGtlTlpMekJFc0NwY2FCTTQybmlraTFXYzliTjBTV255TWlKSmVGbVg0VjB4VVNmRmx4UGRaK1g0Z0VDNWtEclFpU1c2eFovVEtGUlNpRGR0QWMvKzlrYjJJbXgrTC9vbjA0cGZQMWtXc2RlaHBickw1VFhlRGFsbjJiWGE0blp4NUk3Z0VaKzFrTjNvM0tiUzhHQmVqR29IKzhVKzNjYzJJWjRZTmk3YUYveTlnWWduQkZpUVNsdWN4dm1Xa2s4eVRVVXcwR2J2TEdWbDRuUlZTTnRsaGJjU2RXMGRSMm0wUmtXeWdaRXp6QVZkOFUyeFJWODBtZDlNY2Q3QTh1YjF2L3czd29Lc3RtazJMaVhiMHkwUXZuakZPMGpGK29NTHRMZ0VLWnZYNnM3eXR2WlVFejY1V1ZudXlDZjZHV25LOEs3c2ZwMWYrSGl6ellrVElMaWZLanlPbUFtc29SbWp6Mk52Q0FEZGpjajFteUdFcDJaMFMzZEVzV3c1Z2NIK0xrM2tnWVdRUWg5RWJJQXNwY1duSnNTV1Fac0hzc0VDdmtTdE5KTndpNmNRMzdQZmpSZ2pEbG1JSzZYZTZBR1RTZ050T21adWlSYm9BbkdBWm1BUU1ieklXeExlQTlVMnZuMXZ5YlU1KzFpRWUwQnNIUlpzdEMyVkR3QVIxSTU4MnYxc29NTHRpRUJ6NnhJNzVVbmU4cjltLzVwWmlISmZUaUtYUW1QS2UvZERCaHc4K0ZVVVRuR3Nhc3E3VFFSYmRPYWZNYVg2a1hzNkYyQnd5UjVSNis5dElhN01oWkRzTXJNbUs4NXJ1VmJaRnNFQ3N1SGZ4SzM5VTV3aTMzbm5iL0x4UlRoVnRwK2duQmZBdkt2UjhKTmczaE16SzJrVUpNMThHWTI4SHBzVGkvSFJmQXRGWjVIdXlQbzgvZzNlUUUyeEc1NTJ6aThRbDRiUjlkSVBoVWZvSS9ONnFuaVd0NGxoeHJzQ3MycVY5MlRMWDgyZ0YyZWxpenA1VEZPdGFwZXZQZFozWTMxWiswanY4eDEySk9kTU5yOU9oYnp2N3dKMEY4d1JhK252dXJqNitUdVJlS3BUNDZuQUZaL2VtQnZpZUxSVXJoYmVSVDFzbU9sQVBjajFYR2M3b1liNEpzU0QvZDRXeWQvc2s3bWJ4VWs5cFdCc2kzblJLMm80TVBFUEJQQXB5bmovZks1akFDSWFsS2F6VkpLWmQ5UHNrYVdmeWovQTAwT3YzWmJIM3dSUE5aUytqVER0L2Vwb1RyNkZ1RlZkdU45aTFlaG1rWW1BYWVkK2ZpcUhsV1BvMWZaQjJ5MWxjQ3BVQ2hVM3lXQ3VhT0xBK0c2SmJxcnhDby9RM1dWUTl4a2JldDNVMVBHL3RKUzllWmhmT05ueWc5U3A5dDJ0by93Mi92YnVCNVBjcE55WnpLOWZkWmQ3UG9PaTVMZDVhWXdLTU9HOG03R3l4M1BPQUZkZEhFVk9oS3doNmM0ZFZIN3IvSmZpSG5WVmJjTWRWNnJicjRzb1I4cHpOTnUrNkF3ckliMXF4STNMUGJ5QTkrN09QMzdIclE1NzJSNHBReVdaR2NCZE0yUm5OWEkzL2kwV05jaloxYmFqalc1T0tqeU1wWVdrZFRrZ2Y1eFdVZzV2SnVSYW1XVjdWU1FSNklUeW9CbExmQ3Z3ak9NVDlCRDFra3VZbUd3OGtOc2N1TkRLUFRWOHU3ZE9CeWE2aG5oalZsZzQ4V0F3RHJZeXdtNkw3YU5sbkphS3NpQStwV1J1UE1HT2ZSdWpGZDFlS1R5RXIrMEVSM3lPcUd0bFpWanAwK0YrcVZXSmVGbXA4dm13VnhCNTNvMWlrMkhOWWVHWGIzanpUdjhPeUxoUGpCU2tRcGF3NkNYbFpjU1NrekRnOW1aYmROc3ZlTWdMbTh1amRRRmgzZ3dOVm50VUxtcVdRcGU1VWFSdG5SalE0THVEbjQ0ekIvZjRvazNMRTVLMGlYTk5IK0RLRHhYcW9lQllaVkJnSDRsT0lvVlZnMExIWFpzWDJ0RjhDZ25sTnMrdVB1djU5dUJlTmhUZUdBUkJKNlpIK3VoZTB1YWxoL25lS1VZakJNZExKbzBsRVVsTE0wbUhsNGZ5SFVWMGI1Z0crTVd3UTZ3alZWZjlrWnlPeUhvN1pvdHQyQTdlaEJpMU9mSXpvalVoUFpLMWg4L1NMWTVnaTdGK2trbDlldDNpS21hYXhNVDBZMmRpUjd5ZVhHYlVaRER4S3R2WCtMUXJSOFFOVkxpVENYd3YxTmk5Z0ZqSElCUGo0cXpjQm9NbnlGMEhlcDgvVlNtbUpQSFpMeFlBbXk0aVBvdDhBT2tDVmFVMHZRTWRGZGZMc0lhSkVGcXVieGNFRSsxeHJsUzl0Ny8xM09aZ1hJVW1ndDNIVDYwZWFnOTJ0cHkrNWZoV2VrSThUOUdkM2tXWXhJVklQckRLYXA0UnNXa0FIdGk2NXpUdlV6SE0yWXpvQkJ3ZDVSUTJ0eXFsb1A1UmNZZ3BJUm5hSHBxcit1TWFsQmxiOUlsVGsvNmgwQXZIdXQ3cC9HQ3RxaVFCcUowR2xGd2J5ZXAyeVhEWVAvcHpFSElTeUZpUzhlMW1VcnZqckhOV2dGYVY0Ky9rMDQvdmpZUGZzYWJFaXFYNUxzVnJpUVVxcExIU0ZTVE90ODBKbWVDSDJNdmZxdXA2U1VwSUVPWWNwdzhIcjI1VVRHRlRyMEFPSnloZE9uOVltTVNVSTFBNWkyTW5DOTV4WEVzd0dJenk1WFFubDF2NFBJRTFXRzR3dDR5d25TTmlXQ28zazBYbXFHNXoxK3orYlJRdjc1T1lZbk9mNk9KV0pFejVjeThOazNWbHZhcEwvMEgwcjVQRzQ5bERTWWJtT3JtTnZhYXM5dXRhV21lWnBiVmM4RG1mWTN4TWowWWpNblN2cUdSeENGZ3hxZ3kyNGUybTJNL2FzaHUyV3BmS2FEU1NBQ2JHZ2pIOXFpUlBTeXROVnc5RkRVMzhnWVgxaXZnSklWTllBclBEZWxWSnNzQTJwODVJZmJ1c0pzemVERmhCZzhNY1pGUkpIRUV0TXV4SHFhR0Zpd1Q2YktmanF2UStCUkpwTUZLUVZ4UG4zQ05IckF4dEJSa3l4Tm56MTJyYklveUFEamd1TWRlMExNdXd0TWhGdjI1T2g5RFFVckdrTkgveGlmMFlMREpDYkpmWS9YUW94ZGpuaVVxVFZ0cDNBMFVLMVdQTEdYQU41OG9QZ2RSNGtqRlh4d29QdU9pZzV2UmRwYmtBbkpjeXN2SGtQZ0RuQVdVb2tsekF5Vm16ck9wUEVKRVZVbTFObVF1NXJDU0hKVXVCU1JBRUM3dHR3Uk8vN1loUEZiN0pUYkIwYVBraVV4UGFtME5aMk9IejhsWGNUQmR5azU4cTM0WExHNHFVVEFCSkRlY3RvVFVTTGpJTUozU0ozMm1BNjM0ejlQUG1DaEpCVXVqdGpNa1YyN29jOU1PYzFNdDlWSzJDTi9vVi8zbXZrbXNzOE1kaTFQVUtNa0EvR3BCNEZvVGtiYS9nL205enNEMFJGRDhBOHBhanROS2k1MHIwWU03TmZ5cVI1UEhob2p2djQ0d0lBTDNOWHZ2NmJ5YXRnOXZ1OHgwcVA5UHFNQ0IyUkJhOUlMeHlTVDYrTkhMRDljVjA4bU9pQ01UWUJMVUViU3dvTG1pSkhkYWc3S2dsamN2aFpNTXF3blFjajhCVkxGcVR2OGdZUXArQ3FWS2htOW1TMGdyQjA2bmt0TTU3dXpNVFhYZnhlU0tpTHFtWlFXTGJFQlFmOUs1UVZaazBtYlQyWEN1dThHTXNTUUZSR3JCZExyUHFFamNEUzcvMkdmMU4xY25GQU5VajlOeDk1YmZ5SEIxcXpPMzhUZ1dPNzVpbjk0d203Qk1QZGpERGExS01EN3pMaFVPM3BTdUFwb29UcFdXaTRGZ2d4ZUR2UFkxNmNUaGlCSE5uQUhxZXo3M01rTm5VdjNoVk03YU1GQjhraVJjck9yK2REWWNjYW4wVXo4Q1d0WUVUbVRLU2VKUWltam1CazJzMndPa2ZyOW91aWV0ekpFYzllbkc1T2dwT3JxQmtENG83TWVydXg4UFcrTElmNFFLZWdnZXdrVU9mNXdBalY2UzlPRWlqVWxERXBHN1NrbzZmSmFESTZCS1pSM3FpVVVxclNlcnRzaFlFOENoRCtWSVNsb2VzbHdFUEF1bS8yYm4zUEtQZG9JTEZtczczZDJKcmhyZmRBZVpobmdCRi93OFM4eFJjVXpkWWpOQUhqTWlaczdieFB2em5oVHp4UkQwY1JTUHlLNzFyMXdoRkY2bWZGRmRla3JzKzRWOXd4L0FTdDhLVjZGd1NpUStvVC9ZQzRHRTJoVmtpNFpnZGxBNzBBM0tYMWd6SXNCOUpIaGFxUUltemRiWE90ZlZPSTVGVjk1aU9qTEhJU1cxMk1TYTlNWFRkdTBieHpCbDNidFhYL2RubEFwR1c2SHNRaTJDQ1AwdUNTZ3BVRGdzdGdNVVJxd0RaeGVxRjRlUlZnZnBSeVNINmgwckF1ejBSTHBwOGRQYWdMMWU2ZDlxSUVSNWs5SXZiaEpPSktUOTkxVnVQeU5QdkN1WFJYVzNVdWl0ZTRjeFV3dVhsUXZNY214U3JhVHNjeXFISG9WVjc3dyt6Y3hnT2xVa1BERittQ1pBOWZSY2xNZG1KQVJOb2xMVDI0Zk9PM0FqNHNXLzBDMzN1TE9xUkc2YkdnaTFzaXZUSWRXVWdEb2FCNWpoWGc3aWFGTHlReFBMV09yOUNqNll5eFZuZTIxNzNRV2MwMWVsTjZsSlNrSVhETmF2U1YwSjZINkhkTkxLMGFTRUN1ZHFwaDhJQ0QzcnFFQWNuNlFESk8rMDdIMEJyeFNwbFZJTFNaanN1WFVBeEdwb0xacG5mVFlTOUg1UmxCOVhMNFQ2SzV1NDNyK0pldWxxRndGUDFSRUwzVVRqeTR5VWFnaU5Ea2RlaEtnaEkrUVNGRXpMOXFWYXE0QVhEcGJCZ2VWUGxMU0oyQWVCZ1pmNGhmaEVuZENhMEtGak9aM3U1OGoxMFhlY09SRlgyb2I5cmdXOU9aeVhDZ3ovZjBLOStOODdtT3RLaFZCUUpHenZZcDU5cGJ5MTRmMlNOTzZBbDhSWTZuckhQa1BPc0ZXL3pyMXh5NFRoWXVWdzBtb1lJL2VLZGJjeEcyS2liYVpydXRjbE04d0pmMUJRQ2tmRDUwQ0hORlVKS1VPSkZWdGdOTGYyNFlMUWlPNkFsQVU0a1F2SlorQUhYeUwzSlRJZDJOSkNKRjB5NG9ONldRV1ptUmRyZE8yWlVkL25EbG01RjhyUkRRby9ucFZ6ekRJMXhqbVFtZFNWemQvbE12aDN0dVVzTFlCRmVHUmEwTEJTM3JleEkzZDF2c2Q1TWZMcjluVlVheUxvYXd2Ly9BU3ZVMUNEeDZrbUVyMEg0TkphdUVsdnJaRXZmSXVxVFRxMFJOc0cxVDNleCtYdFpRaWZiY2p3T0FGdmdEd3JJbENhYk9kVVhCUkZPcG5wdkJuNUlSdHppRStybG1KazdDYkxyRnBla0VsckQxQXBSQWZCYUx4TVdIMUwzZG5MUnh4NkxSVVVoYllCNnE3V0daWEtqWld5MmFXY2RTRHFJK0pPZTBIMFFvNkNqeHBPR3h3bFJrQ01ic0kwWFN4UE9QdjIxa0VxekVZNXlpN3o5aEZsNERDZkZVallvaG42LzBkL3VRSnZyblhTc0k3czMxVzdBWUc2a29rdkVQazFBalZTZ3RnRXFaRGxKQk81enA4eHdWT0d1Z3QwU1BZSE9FQ3dIdW82QmVocHpDNFZybHhHYzRWbkl6UVh1UGFENHI5RmpXeEhyV0wxNC82ajBzQWRLcTdkalVBWEJjeGcwTUhWa3ZOc1pydytDd3BBM281RkZxZkhST3hpUTl4dTF3c3ZRbWFmckZFb2xIeFFGTEpEV00xNG5aUCtPRFdNM3IxOXlkL0pEbXpjc0F4UGJCeXRndVVHSjNKWmhFcGt0amRFZVJwU3BjU3A0Rnp4TnhOeVBnaUZ6WmtTZVRrMWsyQXpaMmJneFFVYjlMMDZ0bkl5YkFwSlh5OGF0Z2EwV0hyc3NZTXpiTFJ2M2U5VGpJbStxTHY4bzRrZm1zVU4xZ1B3TEVxb0kwRjlWaklJQkdGUXM0TWR1aE5IalArV0FFczBpR3RvelBPWGNYRWpwMUVVUWdwYzVWK09HQWV3TXYwT2poWmZWNjhKc2VscnY1RDJwMHlTTldlMkVXWWJvK3UreU4vWlRkYmJNKzZFdElraWI1TlVPRzNsR2l1eEg4OFBJUkJ4NElmK3ZWTHFxLzFiWE1mcXhaTERzOXRnc3Q3VUpVK0J6Y1JtbFYyUTV1aCt5S256cjUwZmV5MXJQcjhuODYrQ0JkdHp2LzFLL3I3a2tucmFoSnZPQ3RtN3dlQjZKU2JLeVJPN2U0ZlhraUtnMzZDNFZpZ0g0ZmphdDkrTFZ1UFdmbm9uWmswUXFUU2wyeHJtOXRDeFlTN1VQVW80eEFILzAzT2pYVnhhMnBZaTFxVkVWdFlLM0ZBRmhBRU4rQlBFMko1MlVTS1dBVmNKZEZGc3d1MTJVSEh5SzJHZGlubG5OSkhRdzBxaEhObUpIckloRGhKRjZlK2JwZ3lGTmhKV0U3SUNFNW94N2VpVW9jWGdHTWJ5R3BRalR1T2YzVFlQWlh4Z0lVbVNBb0E5cXZUeXlSWWd5WDhvSHdocEMydHh6NExkL0Z2SWowVkN0blNGMU9SRVBjK3oxTUhQT3VUU1d5VDdlMko5SXEzZ2lSNE5NN3p6Q3lvRDdpbEw0WVoyOFk0YzZiQzBTSDNzbDZXbmpFcEl5MjZqZG1hNitMSmtUdlpLbnB6QXJLUWRlbzZBM0lZb1N1YzJYeDdRTDYzMXphajlWbmJueEVzWWhFRjBFTjlSWUNXR3orOWZOQ04vRlhXRCtiZ3F1VkRFUUJyQWl2Q1A5bmw1RkZjUXhiUEY4UWo4VzFYS1ZBMWtqUmRFaW9ZYmZBV2FvNlpKTndXZ0V6Q0NtMmNhOG5KbER6c3dkY0tGT2o1cnpld3pKVGJ1N1FCdTNKUWlaUmpSbnZRWVc1SGNPenFISVA4MWM5TXBWRmpZRTNqRGkvNE5LQ1hvb1diVzVnUnhyTElVaElZVmVMcGQ3K3RpTXF3cm1pTHQyclNNdHhDakRnUzRoSGtVZ1I1T1VxeGdCdkNvbHEyYVAzVnBGZ1crMkd1Z1ZxRktOQlRTZGx5Tnhwam9xMGpObzk2QVdHU0lVNThvSTRiVlcrYmlwU3lEdE1LckJnd29jSCs3M2VlN3pOdm1tQlF1UkNQTXlHaE9HUldEdlhqSmVBakp2d2VjVDQ5bFQrb3lFOXU4RWNCTDNPOU1TVGFwUVdXU01nNFJxeVoycExPcDNrS2RSL1dWN293WDNMVGR1SXJDQm1GSTRHbXhneS8vZlZrT3lYRlNRd0VmSk54VUo1VVVzZVEwZzdkMnVzUGJ1ZjIyZklDTHh6SXQ0TjFCai85RzRGYmROVGoxYTgrWWgxMUh2VTJYWmcxQVhsOUp0SWp5emxXTkRtVUZjLzdGWElLeUlNM3Y0T1FPMjJreGlQQ0xiOWpLbTJ1VjNVMm5IeTc1TW9vYlAyVkczWEpLRysyNks5UGxpUlZJcXo0Sno5UklYYWVsV2IwWFRHOHhoRDNBWXd2TEtOdTFsVWovQVJnZmxRWE9YMk9sdUpqZk1vUW5lam1zZWNBLzE0R2gyUWhjMXZZZkNqMDhEcngxQVkwQWNKOWNtYnM1SlZQNTFaTjZXQ3k3cVMzNXhzanJxL3FFVE9wT1kzZzVmVS81dDBWY1ZVWkFEak1TSnZsei9qZVh2aGF0Z24yOXFLNjFSbFB0L3I0WjJNcXUvVjBneW5LdmxsdjRkdzIxanQvNVR1VWFwZkE5VGI1bDdCS0tydW9INXRDWmZiZSt4Q0RPVEVTTytsdVFhU0l5blBGMHg0aGVIOStxeURjZzNvdVdIMHNTby83OHczSU1rVEVRRmRHUG5nNUVHaWZDRVQxK3RMbWIrZHQ3NlZIUzNZRnFpOTJkYUp3cTlVYU1qbVlXZkYwVW5XYnJ1ZkVOVFdVUmFnVnJnMEVwd0FjdWZpV2tPd0xLOXY0ODlQNE84NjI4a2hnblEycmZ4eHQ2UUMrcWZUQ0lNeWIrM3FvQkpiWThpRlMwSENEVzZxU3MrTThTWXgyM1crckxKVmViRWRzazJwdTdlam5FbTZVT0JKWGdPNVpPWnNqb2dFOEFPZnQwUlZqbklIdjdyYS9salRlaCtRN2lJQWNPZWZWL2VHbDhDczBZblQxdnphZTB0UEd6V0VJc0dSdVFLUzBKWU8xejlXQ3FOQTVIMTJTaFpkRmZXMzUwcTQyMHRxQ0M3cm5DQmxhMytHbEtrK2MxelUwdUt3d0hOZEtTL1hnRUhJSURpQVBmQS8rNzhzUmh2WWQ4N3RSWFA1NGw3RG5Ha2VrSnZQL2laSjQ2TkNmdHYwa1BvOUZJZHJsUGlKcFhhcFpaT3UzNXdqSHAzbjRobk9xNUF5QU5FMnM0SUdkbXNjR2ZhU3lLc3RrQlA1dUpNRDhGdzRIUW11eHZGWG94cWsrU0hTS2pWN3Zzb3kySytnYnRJODF3eFRhb2FtS0l1dDhNZi9oaTg4VnkzZEN2cGIrZW9vNjFmRE92YkRUSExxblI3ZEZrWEY4UUVVbzIzM0FteEtrNTZSQjdzN3I0alVwc3RiTC9CMkVkT203SnBxY1Q1QTYvSXgvYi9iVjgzdnZ5eHU0aERqQTYrQVBPQk5yQlBxenAwVEExQlJ2UC9pQ3ZUMllRMFc2cmJzZjJMU2w5ZTRvTG1lcEc2RE02bGVoWXczSzdUaUZIdXBJSWxBb0gzNHczTE1iSGVtMDZCdnhIN2wyNTVVbEhUVndLU3hxdW1UUnhJdHk5WG1qSHcySE96V2lBVjBSUlcwQ3BpWnpvTCtObFpOd0FmaGxrZFVVKzJZbE1pSmRIcFJpMnY0R09MSTJvd2grYVgzbmFjTzFMSFN0Y1F0cGVDUFJybHRUb2JJdzZYTFloVHB6SCtUa0ZWdVQyZTJjSWxqazVTNis2RDlHcmJMdWlKUWlpQlloNmtNTlpibUlhbzJhZDh4NjVvNUhLL2xqbHVMUnQ0c0xUclFmUUVoakxVcFVoU3VnT1laRlNhalpucno5a2g4dkxsMXFkSWZPdkY2RTVoM09hbElEcDNzMTBLOVN3QVNCYnJiMzZ0dW5NYW0zY3RrVVdmQXYvbDNKaGxRU2w3T09XWFJJVVNvbUdyR1pDV3BQbUc1ZnlIYm5qTEgya1IyZS9xdDFVMzAySlhEcTVQVm9LVUw5WTRCcXBUMDV4RGlhUGt6RXRGb1VCWi8zaTgvVCtlUmwrTU5FQTkvdmxWU1RsbFFFUUZIS1BwL2I4YmVvbElxQU5XQ2hQY2RZWlF3dk5JekFpb25UbzNvTGdsU0k0MGkwUlgyVE84WVh2cXBQODhLR3pQRzJaL25uZk5KL25pcDFhUXNKMzhGVDAxcTJNMDk1VnFVQ21hR1BMclQ1bDF4RUlIMGN5aDBJQmZRdTFhbFRTek5SME1pU3VnSkEraENTZXMwTVkxcFovUno4QVM1c0JDZkp3M2xCY2tSenhhYi9CT3lhT04rRk4xZUtWRkRVL24zNzd2R2Z0ZE84NzF0U0tMQVJ6L0dHNTRNRGNtMEkwUjErS3Q4Q08reVl1ckc5Z2c5VzduTFkwSDlVenNyUTgzdFhZNVZOZ1FTUUVHa3NuV0VmWkVEOERrcUFTZHgrQjN3QjdiUDJLV2FVeEMwRFhrZlhVVWlEQXR2U0xJVDdENy84MVI5UnRtUTFua3A1UllLdEhHK2dsak1iMGlQYU9YNkp2Z3F3RC93RHNKTVdqRFVJTjlPeWpOcHBsTE1xc0dVdkwwd2g3UWlYdk43NldBenEwSFZHVVJ0Q2NpbUFzeWtva0RNZGJXcVVKSjNhbVFDT01mVUYxdkFuMDNzZCtDaEQvWFFuSEY4M3F0M2hGT3pQUVZGdGtKYUpkV3JwRGlRaCtNSDZoN282RzQ0OHArVllrd201Q0ZqZlB1cXIrYkdNSFQyc2xaMlNSaXJDUEEzVHRrdDFkSGxWYllNY0l5dVBPNTFCRDdmTHQrU1ZvVzIvaGVwRmI5QjlWM3E4c2ZId3RLTzRlcEhNSjZFN3hrSkNPZEVuMW9pWERlOTAyUjFaNTdvMWxFdTVXZ3gzQk1DMHFPbmFYU1FoMXJjdWcrdUIrL2ZkWExISlZteWFhWTZYUkNyeDFQb0UyaGY3RFRXeGhOVEpDSHJLWmk0MWgwTWo1TVRSNjhFa3NtSFJtaXYrdWVBd3hUZmtyWlB3S2NsTjdrQklORGVWMWlJQUVYTmkwV3ZHWUpIRG9ZZ1ZINTllZUtuZnVQbWtSby9XZDcwZmt1T1hidktndGhyamJNaUd5dWRwOVArUVpSSmk5T1hDbWgwZzh0WUtiTkhISXk1R3hNeXkwVlE3TWRkT1BhQzcxS0p4QUpwRC84YS80S3Yrd1o5S2lRYVY1bERrQ1hENktPOFlzejlMM2JKbmliTVF4SXhneUE1VElrYnN5ZjdDcFR5bzBxVy9yZUZpVnhBYyt6L3Brai9yQnJVTHBpWUlNNG0ydjg3d0NRK0R2Qm1ZaEdQSUg4WVN2cTJSSUVoaE1VNjdXQWpWSVlJSTJZZ240bzkwOVdJWUZrTkNhUXF1cHhnQm8yMnE5K21yYjEwQVZwY2M1Z0RQZzVla1Y1V3U1bTdyZyt2b0wyNWY4bFBDOVdVZ2tCbzNqa3VXdDM2SnN2Mm81VkgwNnlOYVNSZ2VPVy9OY28wMTJBWXlrb2NhRFJtQkRHZkFHLzZPZ3pYZXVpTjNHdXVVNVQrenhCT0RlNnBPdm9jYTQyWWVBQ25rMVoyZHluK0dqa0htcEY4MzFpWm5UcXJERmRGV3JJRW14ZjJ0SFRIMHAwVjFESFIzVk5nbFc5VnFiWlY5MnVMZkZUUFlHSUgrUzZzUkJXaFZ2VTgvdnVEUXRMRU52Y3Nkai9lZ21DQjFCRkQybUwrSUZXc1IzaFlBYTNkaUFXeFdoVTJiMjNDQVloQ1lXY0t5REtBb2YyaWJXcTFYbzd5NzVrbTFJL1FNUVN4QmdSVitIVzdMd0t3T2JQSXJDQy9oVG9XR0tEcFlNQmhIL1E4aWVGeDBhUVBaaWlvUlhtSDdTcHJENHZXV29ObnFxTko2UVlqc1RvUWE1bm4rYUNZUWlpNGhWM1NzOFEvMk9yQWVqMzdWRm1ucGcxYjdTZDZqbW1MU21oWm5ZVlF3NnBjVkc4dGVHbERxRGYvY3JZZmJtelBIbWt6T3pwWkwrT29pUUNGbjZIR2J2Q2pzK3Z6aElvdDR6a2w2NGJuVHJjYXVGa2J2dUJjbFlzdHRqeHN5eTh4emZOTHFhVG1ML1hGbHVHNDY5QUZsQVMrdlVTYjk2M0FuZGlvdGFPdHFIcXV6YndPdldMVUlYSUJxNzRJa2JYSnlzdE5WVXpPSVNLZW9za2htRC9yc1RBTHZWZllKekRIUGhkWmxJRUdGVTB6VSs3SUlzeVo1cDJlMGZiVzJuWU1rZzBqb0NMVDVkVDFudVcwMk5CaTg3ZUNOTTAvQjhQVUwxVjVWcDVzVzlQSnA4RzE3RHlQTlJWSE5ndy9nQnNFOEFRaFhXcGVGajl0Um9IMTdhVXhyZmYrQUo1bDBVVVgzYVQ2dW96UWZBQi94SnJGSVQrSDhHeDh5WDZyM3dRdXVDZjA0d1hLekxlMVROTWJ0djVCa29xaWZQY2JFT2pKajhub3VaOXBkcm9VUzdhQkM3MnhDbWkrK3o2eUI0T2xTRTM0Z3pxdjNpTEVCUjZnOVYyOWVabGI4VG9GNy9QL3BDRDRta2FyWUhDK1lCM2hKZkZjS1ZSTnZSYm5CSno2R2x0bElWb25JWjFxSUV4SGJZa1hXUjVmM0g3c09tQ3BvUERGQjIvdWo0RVdGQmFpMjF6OXVzTm9leG80RFl1dXNUc2c0QVVSckRZK3EvTzNJM0pHYm5xSDluM2FWbzd4b2Z6TlRsMHNqYThnN1FCRGhZRUtmMFovckF2N3NmQVVyWTd1c1hEaVJvdlVWbHRaS1kwV2IrQ0JXK1ZMS000YVdOeXorRHV3ZGhGR1FDMXNNMS9yV1JWWWVKS3VJeUVEZEx6N3cvek1zSFZLUDUwS0JRNmFxVWkreFN0NXNpOEQxTC9UakUxeE9vTXhlMWNWczBGVHgzOTFZQnBsY3hTVVdJeUlwWVlmMHR3ZGlsZ3pESHpaN1dJR3F2RmJDd2NOb1ZWRnBjOXI5c0FTZktQRTh6dXAxY21oRy9XUi9Ka0ZzM3l5ME1mdUNsUVJFa0lEZWE3YW5USjFZK0oxZGphQVN1Z0VlckZ4alhhUUdYWXRPMnA0dlNGZ05jSGh1NUx2bGsyOXdtUXd0M0tEZjN1WFdEcUdMbVh5NldFZFdqZlRoMHZkcDA5N0g3cE92VkZyTkRtOGpPSjZucllmcTVmcVZFK2hyQXF1OWQ1VUdSbm96WEZTbmV3bG5vTVlNbUlLUlV5cnRncm9TaGtZVVJEczR4R08yNmFTWHJJZUNyczdTQXZ3V0wrc254UmsxUnJXOUp4OFYwbGd5Y0JsQWVRaXEzTWNObFl3cUJGMUtQVTNOdVR3UHRMblNkKzU3Y1B0c2VmVlF0dDZhZjVvV1JTU0tialZFVkZIS0YrZkdRR3Z2UUhoOVE2Rmo1cExiS0dJa1czVFhvMlJRYW1GZ1dDM0lGZDJJVE9nYitiS0FkTEhKbEJqZWhKdUZ6RzgyMFdwa0RUdU52WkR5WGhjSGtZcFhVaWlVZDYyNFVnekRmTHVidmk2ZWpMRXVRWFdqMFhXajZpMldQZ05oa3BYd1R5bDk4U0NQaElWeEZiM1VxQUxjcjkiLCJtYWMiOiJmMDZkMWE0M2E2MTE2YTMxNzZiMjc0YTRjZGMwN2FiYWM1NjVmYWJlZGU3NzM2OWQ5M2I1YWNmZTg5YzA5MmMzIiwidGFnIjoiIn0="))
   this.createCompanyForm = this.formBuilder.group({
      owner_email: ['', [Validators.required, Validators.email]],
      owner_name: ['',[Validators.required]],
      company_title: ['',[Validators.required,Validators.minLength(1)]], // Corrected this line
      // categories: ['', Validators.required],
      plan_id: ['', Validators.required],
      price_id: ['', Validators.required],
      advocate_id: [''],
      formation_type: ['direct', Validators.required],
      message: ['Click the button below to access your company. This system comes up with many amazing features. Start your journey today to stand out tomorrow!'],
    });
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');
  }

  ngOnInit() {
    this.breadcrumbService.setBreadcrumbs([{ label: 'Company Management', url: '/company-management' },{ label: 'Companies & Users', url: '/company-management' }]);
    this.breadcrumbService.setComponentName('Company Management');
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');





    Chart.register(...registerables);
    const data_one = [60,10,20];
    var data1 = {
      labels: [
        "Active",
        "Idle",
        "Manual"
      ],
      datasets: [
        {
          data: data_one,
          backgroundColor: [
            "#35A476",
            "#626866",
            "#E77D04"
          ],
          hoverBackgroundColor: [
            "#35A476",
            "#626866",
            "#E77D04"
          ]
        }]
    };
    new Chart('myChart1', {
      type: 'doughnut',
      data: data1,
      options: {
        responsive: false,
        // @ts-ignore
        legend: {
          display: true,
          position: 'bottom',
          align: 'end'
        },
        cutout: 90,
        spacing: 1,
        borderRadius: 2,
        borderWidth: 1,
        layout: {
          padding: 0
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            labels: {
              // color: 'rgb(255, 99, 132)'
              boxWidth: 14,
              boxHeight: 14,
              textAlign: 'left',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            position: 'nearest',
            bodyAlign: 'right',
          }
        }
      },
      plugins: [{
        id: 'custom_canvas_background_color',
        beforeDraw: (chart, args, options) => {
          var width = chart.width,
            height = chart.height,
            ctx = chart.ctx;
          ctx.restore();
          var fontSize = (height / 260).toFixed(2);
          ctx.font = fontSize + "em 'Roboto', sans-serif";
          ctx.textBaseline = "middle";
          var text = "Revenue",
            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = height / 2.4;
          ctx.fillText(text, textX, textY);
          ctx.save();

          var fontSize2 = (height / 200).toFixed(2);
          ctx.font = fontSize2 + "em 'Roboto', sans-serif";
          // ctx.font.weight = "800";
          ctx.textBaseline = "middle";
          var text2 = '$0',
            textX2 = Math.round((width - ctx.measureText(text).width) / 1.6),
            textY2 = height / 1.9;
          ctx.fillText(text2, textX2, textY2);
          ctx.save();
        },
        defaults: {
        }
      }]
    });

    //fetch companies data
    this.getCompanies();

  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.addEventListener('hidden.bs.offcanvas',() => {
      this.showCompanyForm =  false;
    });
    setTimeout(()=> {
      const userImage = JSON.parse(this.encryptDecrypt.decrypt(localStorage.getItem('userImage')));
      console.log('userImage',userImage)
        const user_img_tag: HTMLElement = document.getElementById('user_profileImage') as HTMLElement;
        const user_name_tag: HTMLElement = document.getElementById('userName') as HTMLElement;
        user_img_tag.setAttribute('src', userImage.image);
        user_name_tag.innerText  = userImage.name;
    },300)

  }

  getCategories() {
    let decrypted_data: any;

    // Show the spinner
    // this.showSpinner = true;

    let URL = this.baseURL + "api/categories";
    let headers = new HttpHeaders(CategoriesConfig.CATEGORY_HEADER);
    let body = {
      "limit": 1000,
      "fields": [
        "title",
        "description",
        "created_at",
      ]
    };
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, "POST").subscribe(
      (response) => {
        decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
      },
      (error) => {
        console.log('Request failed with error', error);

      });

  }
  get formControl() {
    return this.createCompanyForm.controls;
  }
  shareData(data:any) {
    this.dataSharingService.setSharedData(data);
  }

  resetCreateCompanyForm(): void {
    // Process checkout data here
    console.warn('Your order has been submitted', this.createCompanyForm.value);
    this.createCompanyForm.reset();
    this.showErrors = false;
    this.inviteOwnerModel = false;
    this.ownerHasInvited = false;
    this.inviteOwnerButton = false;
    this.inviteOwnerButtonDisable = false;

    //assign default values to company form
    this.createCompanyForm.patchValue({
      owner_email: '',
      owner_name: '',
      company_title: '', // Corrected this line
      plan_id: '',
      formation_type: 'direct',
      message: ['Click the button below to access your company. This system comes up with many amazing features. Start your journey today to stand out tomorrow!'],
    });
  }
  inviteOwner(company_id = 0, message = '') {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }

    })
    let decrypted_data:any;

    this.inviteOwnerButton = true
    let URL = this.baseURL + 'api/company/invite_owner';

      let body = {
        "company_id":company_id,
        "message": message
      };
      let headers =  new HttpHeaders({
        "Access-Control-Allow-Headers": 'accept',
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
      });
      let method = 'POST'
      this.showSpinner = true;

      this.httpClientRequest.initiateHttpRequest(URL,body,headers,method).subscribe(
        (response) => {
          decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));

          this.createCompanyResult = decrypted_data;
          this.ownerHasInvited = true;
          this.inviteOwnerButton = false;
          if(decrypted_data.company_id == company_id)
          {


            Toast.fire({
              icon: "success",
              title: 'Company <b>'+decrypted_data.title+'</b> with initials <b>'+decrypted_data.company_initial+'</b> has created successfully. And an Email has been sent to the owner.',
              // title: 'Invitation email has been sent successfully.'
            });

            this.inviteOwnerButtonDisable = false;
            // this.cdr.de


          }

          this.showSpinner = false;
        },
        (error) => {
          console.error('Request failed with error', error);
        });


  }
  createCompanyFormData( ) {
    let decrypted_data:any;
    this.showErrors = true;

    // Handle form submission logic
    this.submitted = true;
    let company_title: string = this.createCompanyForm.get('company_title')?.value;
    let owner_email: string = this.createCompanyForm.get('owner_email')?.value;
    let owner_name: string = this.createCompanyForm.get('owner_name')?.value;
    let plan_id: string = this.createCompanyForm.get('plan_id')?.value;
    let price_id: string = this.createCompanyForm.get('price_id')?.value;
    let advocate_id: string = this.createCompanyForm.get('advocate_id')?.value;
    let message: string = this.createCompanyForm.get('message')?.value;
    console.log('message',message)
    let formation_type: string = this.createCompanyForm.get('formation_type')?.value;
    if (this.createCompanyForm.valid) {
      document.getElementById("close-create-company")?.click();
      this.resetCreateCompanyForm()
      this.inviteOwnerButtonDisable = true;
      this.createCompanyForm.valueChanges.subscribe((values) => {});

      let URL = this.baseURL + 'api/company/store';

      //replace monthly to month and yearly to year
      if(price_id.trim() === 'monthly' || price_id.trim() === 'yearly'){
        price_id = price_id.replaceAll('ly','');
      }

      let body = {
        "company_title":company_title.trim(),
        "owner_email": owner_email.trim(),
        "owner_name": owner_name.trim(),
        "plan_id": plan_id.trim(),
        "price_id": price_id.trim(),
        "advocate_id": advocate_id.trim(),
        "message": message,
        "formation_type": formation_type,
      };
      let headers =  new HttpHeaders({
        "Access-Control-Allow-Headers": 'accept',
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
      });
      let method = 'POST'
      this.showCompanySpinner = true;

      this.httpClientRequest.initiateHttpRequest(URL,body,headers,method).subscribe(
        (response) => {
          decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          // console.log('decrypted_data',decrypted_data, response.app_data);
          this.createCompanyResult = decrypted_data;
          if(decrypted_data.status === true)
          {
            this.inviteOwner(decrypted_data.company.id, message);
            this.inviteOwnerModel = true;
          }

          this.showCompanySpinner = false;
        },
        (error) => {
          //error() callback
          console.error('Request failed with error', error);
          this.showCompanySpinner = false;
        });
      }
    else{
      this.showErrors = true;
    }

  }
  getCompanies(){

    const localUserJson = localStorage.getItem('isUserToken');
    let decrypted_data:any;
    if(localUserJson) {
      // Show the spinner
      this.showSpinner = true;


      let URL = this.baseURL + "api/companies";
      let headers = new HttpHeaders({
        "Accept": "application/json",
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
      });
      let body = {
        "fields": [
          "users.image",
          "companies.id",
          "no_of_employee",
          "title",
          "logo",
          "companies.status",
          "companies.advocate_id",
          "companies.created_at",
          "plan_staus",
          "closure_plan",
          "has_setup",
          "users.first_name",
          "users.last_name",
          "grace_period",
          "company_initial",
          "payment_status"
        ]
      };
      this.httpClientRequest.initiateHttpRequest(URL,body,headers,"POST").subscribe(
        (response) => {
          decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_data);
          if(decrypted_data.length > 0)
          {
            this.UseUpdatedResponse(decrypted_data);
          }

          this.showSpinner = false;
        },
        (error) => {
          //error() callback
          console.log('Request failed with error', error);
          this.showSpinner = false;

        });
    }

  }

  UseUpdatedResponse(updatedResponse:any)
  {
    let pendingSetupCompanies:number[] = [];
    let activeCompanies:number[] = [];
    let activeCompaniesUsers:number[] = [];
    let activeCompaniesTitles:string[] = [];
    let uniqueActiveCompanies = [];
    let uniqueInActiveCompanies:number[] = [];
    let uniquePendingSetupCompanies:number[] = [];

    updatedResponse.forEach((element:any) => {
      if(element.status == 0 && element.has_setup == 1)
      {
        activeCompanies.push(element.id)
        if(activeCompaniesUsers.length <= 7)
        {
          activeCompaniesUsers.push(element.no_of_employee);
          activeCompaniesTitles.push(element.title);
        }
      }
      else if(element.status == 1){
        uniqueInActiveCompanies.push(element.id)
      }

      if(element.has_setup === 0)
      {
        pendingSetupCompanies.push(element.id);
      }
    });
    uniqueActiveCompanies = [...new Set(activeCompanies)];
    let inActiveCompanies = [...new Set(uniqueInActiveCompanies)];

    this.activeCompaniesLength = uniqueActiveCompanies.length;
    this.inActiveCompaniesLength = inActiveCompanies.length;
    this.invitedCompaniesLength = [...new Set(pendingSetupCompanies)].length;


    if(this.noOfUsersChart)
      this.noOfUsersChart.destroy();

    this.noOfUsersChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: activeCompaniesTitles,
        datasets: [{
          label: 'No of Peoples',
          data: activeCompaniesUsers,
          backgroundColor: [
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)'
          ],
          borderColor: [
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)',
            'rgba(53, 164, 118, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of People',
              align: 'center', // Align the title at the center
              padding: {
                top: 10 // Adjust as needed
              }
            }
          }
        },
        // responsive: true, // Make the chart responsive
        // maintainAspectRatio: false // Disable aspect ratio maintenance
      },
    });
    this.showSpinner = false;
    this.shareData({
      "activeCompanies": this.activeCompaniesLength,
      "showSpinner": this.showSpinner,
      "companies": updatedResponse,
      "inActiveCompaniesLength" : this.inActiveCompaniesLength,
      "invitedCompaniesLength": this.invitedCompaniesLength
    });


  }

  controlFormationType(event: any){
    let selected_value = event.target.value;
    if(selected_value)
    {

      this.showCompanyForm = true;

      let URL = this.baseURL + 'api/local/products';
      let headers = new HttpHeaders({
        "Access-Control-Allow-Headers": 'accept',
        "Access-Control-Allow-Origin": '*',
        "Content-Type": "application/json",
      });

      let body = {
        "limit": 1000,
        "categories": "1",
        "metadata":
          {
            "public": "1",
            "type": "plans"
          },

      };
      let method = "POST";

      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_data = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log('before', decrypted_data)
            let resultData: any[] = decrypted_data.products.data;

            if (resultData.length > 0) {
              resultData = resultData.filter((element: any) => {
                let category_id = parseInt(element.product.metadata.category);
                return this.findIndex(category_id, decrypted_data.categories_status) !== 0;
              });
            }

            console.log('after', resultData)
            this.companyPlans = resultData;
          }
        },
        (error) => {
        });
      if(selected_value == "direct"){
        this.createCompanyForm.patchValue({formation_type: "direct"});
        // this.createCompanyForm.get('owner_name')?.setValidators(Validators.required);
      }
      else{
        this.createCompanyForm.patchValue({formation_type: "invitation"});
      }

      this.usersListing();
    }
    else{
      this.showCompanyForm = false;
    }

  }
  findIndex(value: number, data:any): number | null {
    for (const key in data) {
      if (data[key] === value) {
        return parseInt(key);
      }
    }
    return null;
  }
  controlFormationTypeInside(event: any){
    let selected_value = event.target.value;
      if(selected_value == "direct"){
        this.hideInvitationFieldsInFormation = true;
        this.cdr.detectChanges();
      }
      else{
        this.hideInvitationFieldsInFormation = false;
        this.cdr.detectChanges();
      }


  }

  usersListing(activeFlag: string = 'active', search:string = ''){
    let URL = this.baseURL + 'api/advocate_roles?page='+1;
    let headers = new HttpHeaders(PlansConfiguration.PLAN_HEADER);
    let body:{limit:number, advocate_type : boolean} = {
      limit: 1000,
      advocate_type: true
    };

    let method = "POST";

    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log('usfwfwef',decrypted_response)
          if(notEmpty(decrypted_response)){
            this.users = decrypted_response;

          }
        }
      },
      (error) => {
      });
  }
  controlPackageSelection(event: any){
    let package_id = event.target.value;
    if(package_id){
      let html = '';
      this.planFrequencyPrices = [];
      if(this.companyPlans.length > 0){
        this.companyPlans.forEach((element: any) => {
          if(String(package_id) === element.product.id)
          {
            let prices = element.product.prices;
            if(prices.length > 0){

              if(prices){
                prices = prices.sort((a:any, b:any) => {

                  const getOrder = (interval:any, intervalCount:any) => {
                    if (interval === 'month' && intervalCount === 1) return 0;
                    if (interval === 'month' && intervalCount === 3) return 1;
                    if (interval === 'month' && intervalCount === 6) return 2;
                    if (interval === 'year' && intervalCount === 1) return 3;

                    return 4; // default order
                  };
                  return getOrder(a.recurring.interval, a.recurring.interval_count) - getOrder(b.recurring.interval, b.recurring.interval_count);
                });


              }

              prices.forEach((element: any) => {
                let dbInterval:string = element.recurring.interval;
                let dbIntervalCount: number = element.recurring.interval_count;
                let frequency: string = dbInterval;
                if(dbIntervalCount === 3 && dbInterval === 'month'){
                  frequency = 'quarterly';
                }
                else if(dbIntervalCount === 6 && dbInterval === 'month'){
                  frequency = 'bi-annually';
                }
                else{
                  frequency = frequency + 'ly';
                }

                this.planFrequencyPrices.push({'id' : element.id, title: ( frequency !== null ? (frequency[0].toUpperCase() + frequency.slice(1)) : 'One Time Price Plan' )})
              })
            }
            console.log('this.planFrequencyPrice',this.planFrequencyPrices)
          }
        });
      }
    }
  }

  protected readonly checkPermission = checkPermission;
  protected readonly moduleIds = moduleIds;
}
