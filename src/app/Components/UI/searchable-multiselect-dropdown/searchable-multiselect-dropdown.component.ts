import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-searchable-multiselect-dropdown',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './searchable-multiselect-dropdown.component.html',
  styleUrl: './searchable-multiselect-dropdown.component.css'
})
export class SearchableMultiselectDropdownComponent {

  constructor(private fb: FormBuilder) {
  }
  @ViewChild('multiSelect') multiSelect!: ElementRef;
  formGroup: FormGroup  = this.fb.group({});
  loadContent: boolean = false;
  name = 'Cricketers';
  data:any[] = [
    { item_id: 1, item_text: 'Hanoi' },
    { item_id: 2, item_text: 'Lang Son' },
    { item_id: 3, item_text: 'Vung Tau' },
    { item_id: 4, item_text: 'Hue' },
    { item_id: 5, item_text: 'Cu Chi' },
  ];
  settings = {};
  selectedItems = [];

  ngOnInit() {
    // this.data = [
    //   { item_id: 1, item_text: 'Hanoi' },
    //   { item_id: 2, item_text: 'Lang Son' },
    //   { item_id: 3, item_text: 'Vung Tau' },
    //   { item_id: 4, item_text: 'Hue' },
    //   { item_id: 5, item_text: 'Cu Chi' },
    // ];
    // setting and support i18n
    this.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: true,
      selectAllText: 'Chọn All',
      unSelectAllText: 'Hủy chọn',
      allowSearchFilter: true,
      limitSelection: -1,
      clearSearchFilter: true,
      maxHeight: 197,
      itemsShowLimit: 3,
      searchPlaceholderText: 'Tìm kiếm',
      noDataAvailablePlaceholderText: 'Không có dữ liệu',
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false,
    };
    this.setForm();
  }

  public setForm() {
    this.formGroup = new FormGroup({
      name: new FormControl(this.data, Validators.required),
    });
    this.loadContent = true;
  }

  get f() {
    return this.formGroup?.controls;
  }

  public save() {
    if (this.formGroup?.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    console.log(this.formGroup?.value);
  }

  public resetForm() {
    // because I need select all crickter by default when i click on reset button.
    this.setForm();
    // this.multiSelect.toggleSelectAll();
    // I try below variable isAllItemsSelected reference from your  repository but still not working
    // this.multiSelect.isAllItemsSelected = true;
  }

  public onFilterChange(item: any) {
    console.log(item);
  }
  public onDropDownClose(item: any) {
    console.log(item);
  }

  public onItemSelect(item: any) {
    console.log(item);
  }
  public onDeSelect(item: any) {
    console.log(item);
  }

  public onSelectAll(items: any) {
    console.log(items);
  }
  public onDeSelectAll(items: any) {
    console.log(items);
  }
}
