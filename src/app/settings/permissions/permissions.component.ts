import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {AppComponent} from "../../app.component";
import {CommonModule} from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";
import {NgxPaginationModule} from "ngx-pagination";
import {moduleIds, modules} from '../../Components/project_resources/modules';
import {checkPermission, formatTimestampToMySQL, notEmpty} from "../../util";
import {isObject} from "chart.js/helpers";
import {HttpHeaders} from "@angular/common/http";
import {RoleAndPermissionsConfig} from "../../Components/constants/settings/role_&_permissions/role_&_permissions";
import {map, Observable, of} from "rxjs";
import {environment} from "../../../environments/environments";
import {HttpClientRequestService} from "../../services/http-client-request.service";
import {EncryptDecryptService} from "../../services/encrypt-decrypt.service";
import {IServerResponse} from "../../Components/interfaces/plan_&_packages/plan-listing/plan-listing";
import {catchError} from "rxjs/operators";
import {Module,Role, Permission, Modules} from "../../Components/interfaces/settings/role_&_permissions/role_&_permissions"
import {SpinnerComponentComponent} from "../../Components/UI/spinner-component/spinner-component.component";
import {BreadcrumbService} from "../../services/breadcrumb.service";
import {ToastMessagesComponent} from "../../Components/messages/toast-messages/toast-messages.component";

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SpinnerComponentComponent
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent {

  baseURL: string = environment.apiBASEURL;

  guardName:string = '';

  roleId: number = 0;

  edit:boolean = false;
  showListingSpinner:boolean  =false;

  moduleForm: FormGroup;

  users:any[] = [];

  permissionFinal: any[] = [];

  // Use ViewChildren to capture all the rows with the groupRef template reference variable
  @ViewChildren('groupRef') rowGroups!: QueryList<ElementRef>;

  protected readonly modules: Module[] = modules;



  constructor(private toastMessages: ToastMessagesComponent, private el: ElementRef,private breadcrumbService: BreadcrumbService, private appComponent: AppComponent, private fb: FormBuilder, private httpClientRequest: HttpClientRequestService, private encryptDecrypt: EncryptDecryptService, private cdr: ChangeDetectorRef) {
    this.appComponent.isLoginScreen = false;
    this.appComponent.showMenu = true;

    this.moduleForm = this.fb.group({
      perm_title: [''],
      role_type: ['']
    });
  }


  searchTerm = '';

  activeTab = 'permissions';

  perPage: number = 20;
  totalPermissions: number = 0;
  expandedPermissions: number[] = [];
  permissionsCurrentPage: number = 1;

  activePermissions$: Observable<Role[]> = new Observable<Role[]>();

  @ViewChild('rolePermissionContainer', { read: ViewContainerRef }) rolePermissionContainer!: ViewContainerRef;


  ngOnInit() {

    this.breadcrumbService.setBreadcrumbs(RoleAndPermissionsConfig.BREAD_CRUMBS);
    this.breadcrumbService.setComponentName(RoleAndPermissionsConfig.COMP_NAME);
    this.breadcrumbService.setComponentIcon('assets/css/sprite_images/companyManagement.svg');

    this.createModuleForms();
    this.permissionsListing();

  }


  permissionsListing(){


    let URL = this.baseURL + 'api/roles?fields[roles]=id,name&locale=fr&page=1&per_page='+this.perPage+'&sort=name';
    let headers = new HttpHeaders(RoleAndPermissionsConfig.Role_AND_Permissions_HEADER);
    let body = {};
    let method = "GET";
    this.showListingSpinner  =true;
    this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
      (response) => {
        if (response.app_data !== undefined) {
          let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
          console.log(decrypted_response)
          if(notEmpty(decrypted_response.data)){
            decrypted_response.data.forEach((element:any) => {
              const perm: Permission[]= this.getPermissionsByRoleId(decrypted_response.data,element.id);
              console.log(perm)
              const f = this.groupByBase(perm);
              this.permissionFinal[element.id] = f;
            });
            console.log(this.permissionFinal)


            this.activePermissions$ = of(decrypted_response.data);
            this.totalPermissions = decrypted_response.total;
          }else{
            this.activePermissions$ = of([]);
            this.totalPermissions = 0;
          }

          this.edit = false;
          console.log(decrypted_response)
        }
        this.showListingSpinner = false;
      },
      (error) => {
        this.showListingSpinner = false;
      });
  }

  groupByBase(permissions: Permission[] ) {
    return permissions.reduce((acc, curr) => {
      const base = curr.name.split('.')[0]; // Get the first part of the permission (base)

      if (!acc[base]) {
        acc[base] = []; // Initialize array if it doesn't exist
      }

      acc[base].push(curr.name); // Add current object to the group
      return acc;
    }, {} as { [key: string]: any[] }); // Grouped by base name
  }

  getPage(page: number) {

    this.serverCall(page, this.totalPermissions, this.perPage).subscribe({

      next: (res: any) => {
        this.totalPermissions = res.total;
        let resultData: Observable<Role[]>= res.items.length > 0 ? of(res.items) : of([]);

        this.permissionsCurrentPage = page;
        this.activePermissions$ = resultData
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching talkToSales:', error);
      }
    });
  }

  /**
   * Simulate an async HTTP call with a delayed observable.
   */

  serverCall(page: number, total: number, per_Page: number): Observable<IServerResponse> {

    let URL = this.baseURL + 'api/roles?fields[roles]=id,name&locale=fr&page='+page+'&per_page='+this.perPage+'&sort=name';
    let headers: HttpHeaders = new HttpHeaders(RoleAndPermissionsConfig.Role_AND_Permissions_HEADER);
    let body = {
      "limit": this.perPage,
    };
    let method = "GET";

    return this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).pipe(
      map((response: any) => {
        const decryptedData = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
        decryptedData.data.forEach((element:any) => {
          const perm: Permission[]= this.getPermissionsByRoleId(decryptedData.data,element.id);
          console.log(perm)
          const f = this.groupByBase(perm);
          this.permissionFinal[element.id] = f;
        });
        return {
          items: decryptedData.data,
          total: decryptedData.total
        };
      }),
      catchError(error => {
        console.error('Request failed with error', error);
        return of({items: [], total: 0});
      })
    );

  }
  private createModuleForms(): void {
    // Preserve the value of perm_title
    // const permTitleValue =  this.moduleForm.get('perm_title')?.value ?? '';


    modules.forEach(module => {
      const permissionsFormGroup = this.createPermissionsFormGroup();

      this.moduleForm.addControl(module.id, permissionsFormGroup);

      // If the module has children, create a FormArray for them
      if (module.children) {
        const childrenFormArray = this.fb.group({});
        this.createChildPermissionsForms(module.children, childrenFormArray);
        permissionsFormGroup.addControl(module.id, childrenFormArray);
      }
    });

    this.moduleForm.updateValueAndValidity();
  }

  private createChildPermissionsForms(children: Module[], childrenFormArray: FormGroup): void {
    children.forEach((child: any) => {
      const childPermissionsFormGroup = this.createPermissionsFormGroup();
      // Add the child FormGroup to the FormArray using the child's ID as the control name
      childrenFormArray.addControl(child.id, childPermissionsFormGroup);
    });
  }


  private createPermissionsFormGroup(): FormGroup {
    return this.fb.group({
      create: [false],
      read: [false],
      update: [false],
      delete: [false],
    });
  }


  submitPermissionForm() {

    if (this.moduleForm.valid) {
      const permissionsJson = this.extractPermissions(this.moduleForm.value);
      // Flatten the permissions object
      const flattenedPermissions: string[] = [];

      for (const module in permissionsJson) {
        const perm = permissionsJson[module];
        if (perm.create) {
          flattenedPermissions.push(`${module.toLowerCase()}.create`) ;
        }

        if (perm.read) {
          flattenedPermissions.push(`${module.toLowerCase()}.read`) ;
        }

        if (perm.update) {
          flattenedPermissions.push(`${module.toLowerCase()}.update`) ;
        }

        if (perm.delete) {
          flattenedPermissions.push(`${module.toLowerCase()}.delete`) ;
        }
      }



      let URL = this.baseURL + (this.edit ? 'api/roles/'+ this.roleId : 'api/roles');
      let headers = new HttpHeaders(RoleAndPermissionsConfig.Role_AND_Permissions_HEADER);
      let body:{name: string,role_type?: number, checked_permissions:string[], guard_name?: string, id?: number} = {
        name: this.moduleForm.get('perm_title')?.value,
        checked_permissions: flattenedPermissions
      };
      const role_type = this.moduleForm.get('role_type')?.value;

      if(role_type !== 'none'){
        body.role_type = role_type;
      }

      if(this.edit){
        body.id = this.roleId;
        body.guard_name = this.guardName;
      }
      this.showListingSpinner = true;
      let method = this.edit ? "PUT" : "POST";
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_response)
            this.moduleForm.reset();
            this.closeBtn.nativeElement.click();
            this.permissionsListing();

          }
          this.edit = false;
          this.showListingSpinner = false;
        },
        (error) => {
          this.edit = false;
          this.showListingSpinner = false;
        });
    } else {
      console.log(this.moduleForm.errors)
    }
  }
  addRolePermission(){
    this.edit = false;
    this.moduleForm.reset();
  }

  @ViewChild('closeBtn') closeBtn!: ElementRef;
  editRole(role_id: number, role_title:string,guard_name:string,role_type:number = 0){

    this.edit = true;
    this.roleId = role_id;
    this.guardName = guard_name;
    this.moduleForm.reset();
    this.moduleForm.get('perm_title')?.setValue(role_title);

    if(role_type !== 0 && notEmpty(role_type)){
      this.moduleForm.get('role_type')?.setValue(role_type);
      console.log('role_type',role_type)
    }

    console.log(this.moduleForm.controls, )
    const rolePermissions = this.permissionFinal[role_id] !== undefined ? this.permissionFinal[role_id] : [];

    const childrenPermissions = this.moduleForm as FormGroup;
    const controls = childrenPermissions.controls as { [key: string]: AbstractControl };
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const value = controls[key];

        if(key !== 'perm_title' && key !== 'role_type'){

          if(rolePermissions[key.toLowerCase()] !== undefined){
            const create = rolePermissions[key.toLowerCase()].includes(key.toLowerCase()+'.create');
            const read = rolePermissions[key.toLowerCase()].includes(key.toLowerCase()+'.read');
            const update = rolePermissions[key.toLowerCase()].includes(key.toLowerCase()+'.update');
            const deleteIndex = rolePermissions[key.toLowerCase()].includes(key.toLowerCase()+'.delete');


            controls[key].patchValue({create: create, read: read, update: update, delete: deleteIndex});
          }

        }

        if (isObject(value)) {
          const innerControl = ((childrenPermissions.get(key) as FormGroup).get(key) as FormGroup);

          if (notEmpty(innerControl)) {
            for (const key1 in innerControl.controls) {
              const control = innerControl.get(key1) as FormGroup;
              if(key1 !== 'perm_title' && key1 !== 'role_type') {

                if(rolePermissions[key1.toLowerCase()] !== undefined){

                  const createChild = rolePermissions[key1.toLowerCase()].includes(key1.toLowerCase()+'.create');
                  const readChild = rolePermissions[key1.toLowerCase()].includes(key1.toLowerCase()+'.read');
                  const updateChild = rolePermissions[key1.toLowerCase()].includes(key1.toLowerCase()+'.update');
                  const deleteChildIndex = rolePermissions[key1.toLowerCase()].includes(key1.toLowerCase()+'.delete');

                  control.patchValue({create: createChild, read: readChild, update: updateChild, delete: deleteChildIndex}); // Example: setting a new value
                }
                // Modify the control's value or properties here

              }
            }
          }

        }
      }
    }
  }

  async deletePermission(permission_id:string | number){
    let result = await this.toastMessages.showConfirmationDialog('Yes, Delete it!');

    //re-active toggle button because user denied to deactivate plan
    if (!result) {


    } else {
      console.log('delete permission')
      let URL = this.baseURL + 'api/roles/'+ permission_id;
      let headers = new HttpHeaders(RoleAndPermissionsConfig.Role_AND_Permissions_HEADER);
      let body = {};

      this.showListingSpinner = true;
      let method = "DELETE";
      this.httpClientRequest.initiateHttpRequest(URL, body, headers, method).subscribe(
        (response) => {
          if (response.app_data !== undefined) {
            let decrypted_response = JSON.parse(this.encryptDecrypt.decrypt(response.app_data));
            console.log(decrypted_response)
            this.permissionsListing();
          }


        },
        (error) => {

          this.showListingSpinner = false;
        });

    }
  }
  toggleChildCreatePermissions(event: any, parentId: any = '', permissionType: string = '') {

    if (notEmpty(parentId)) {
      const childrenPermissions = this.moduleForm.get(parentId) as FormGroup;
      if (notEmpty(childrenPermissions.controls[parentId])) {
        const controls = childrenPermissions.controls as { [key: string]: AbstractControl };
        for (const key in controls) {
          if (controls.hasOwnProperty(key)) {
            const value = controls[key];

            if (isObject(value)) {
              const innerControl = (childrenPermissions.get(parentId) as FormGroup).controls;
              for (const key1 in innerControl) {
                const control = (childrenPermissions.get(parentId) as FormGroup).get(key1) as FormGroup; // Access the control using the key
                if(key1 !== 'perm_title' && key1 !== 'role_type') {
                  // Modify the control's value or properties here
                  control.patchValue({[permissionType]: event.target.checked}); // Example: setting a new value
                }
              }
            }
          }
        }
      }
    }
  }

  markAllChecked(event: any, permissionType: string = '') {

    const childrenPermissions = this.moduleForm as FormGroup;
    const controls = childrenPermissions.controls as { [key: string]: AbstractControl };
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const value = controls[key];
        if(key !== 'perm_title' && key !== 'role_type'){
          controls[key].patchValue({[permissionType]: event.target.checked});
        }

        if (isObject(value)) {
          const innerControl = ((childrenPermissions.get(key) as FormGroup).get(key) as FormGroup);

          if (notEmpty(innerControl)) {
            for (const key1 in innerControl.controls) {
              const control = innerControl.get(key1) as FormGroup;
              if(key1 !== 'perm_title' && key1 !== 'role_type') {
                // Modify the control's value or properties here
                control.patchValue({[permissionType]: event.target.checked}); // Example: setting a new value
              }
            }
          }

        }
      }
    }
  }


  extractPermissions(modules: Modules): { [key: string]: Permission } {
    let result: { [key: string]: Permission } = {};

    for (const [key, value] of Object.entries(modules)) {
      // Ensure the value is of type Permission by checking for 'create', 'read', 'update', 'delete' keys
      if (value !== null && typeof value === 'object' && value !== undefined && !Array.isArray(value) && 'create' in value && 'read' in value && 'update' in value && 'delete' in value) {
        result[key] = value as Permission; // Add top-level module directly
      }

      // Recursively process child modules
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Extract child permissions, without parent name
        const childPermissions = this.extractPermissions(value as Modules);
        Object.assign(result, childPermissions);
      }
    }

    return result;
  }

  selectAll(event: any) {
      let isChecked = event.target.checked;
      const childrenPermissions = this.moduleForm as FormGroup;
      const controls = childrenPermissions.controls as { [key: string]: AbstractControl };
      for (const key in controls) {
        if (controls.hasOwnProperty(key)) {
          const value = controls[key];
          if(key !== 'perm_title' && key !== 'role_type') {
            controls[key].patchValue({create: isChecked, update: isChecked, delete: isChecked, read: isChecked});
          }
          if (isObject(value)) {
            const innerControl = ((childrenPermissions.get(key) as FormGroup).get(key) as FormGroup);

            if (notEmpty(innerControl)) {
              for (const key1 in innerControl.controls) {

                const control = innerControl.get(key1) as FormGroup;
                if(key1 !== 'perm_title' && key1 !== 'role_type'){
                  // Modify the control's value or properties here
                  control.patchValue({create: isChecked, update: isChecked, delete: isChecked, read: isChecked}); // Example: setting a new value
                }
              }
            }

          }
        }
      }
    }

  // Example function to get permissions by role ID
  getPermissionsByRoleId(roles: Role[], id: number): Permission[] {
    // Find the role with the provided id
    const role: Role | undefined = roles.find(role => role.id === id);

    // If role is found, return its permissions; otherwise, return a message
    if (role) {
      return role.permissions;
    } else{
      return [];
    }
  }

  toggleGroup(id: number): void {
    this.rowGroups.forEach((row: ElementRef) => {
      // Check if the row belongs to the specified group
      if (row.nativeElement.classList.contains("role_perm_"+id)) {
        // If the row has the 'hide' class, replace it with 'show'
        if (row.nativeElement.classList.contains('hide')) {
          row.nativeElement.classList.remove('hide');
          row.nativeElement.classList.add('show');
        }
        // If the row has the 'show' class, replace it with 'hide'
        else if (row.nativeElement.classList.contains('show')) {
          row.nativeElement.classList.remove('show');
          row.nativeElement.classList.add('hide');
        }
      }
    });
  }

  protected readonly formatTimestampToMySQL = formatTimestampToMySQL;
    protected readonly checkPermission = checkPermission;
    protected readonly moduleIds = moduleIds;
}
