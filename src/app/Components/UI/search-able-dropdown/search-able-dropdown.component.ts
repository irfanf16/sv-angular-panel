import {Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgClass, TitleCasePipe,CommonModule} from "@angular/common";



@Component({
  selector: 'app-search-able-dropdown',
  templateUrl: './search-able-dropdown.component.html',
  styleUrl: './search-able-dropdown.component.scss',
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    NgClass,
    CommonModule
  ],
  standalone: true
})
export class SearchAbleDropdownComponent implements ControlValueAccessor{

  list = [];
  temp_list = [];
  keyword = "";
  _img: any;
  _label: any;
  _uid: any;
  @Output() afterChange = new EventEmitter();
  @ViewChild("input", { static: false }) input: ElementRef | undefined;
  @Input("size") size: any;
  @Input("items") set items(value:any) {
    this.list = value;
    console.log(this.list)
    this.temp_list = value;
  }
  @Input("img") img: any;
  @Input("label") label: any;
  @Input("uid") uid: any;
  onChange: any = () => { };
  onTouch: any = () => { };
  value: any = "Select";
  shown = false;
  public searchAbleDropdown: FormGroup;

  constructor(private ele: ElementRef,  private formBuilder: FormBuilder) {
    this.searchAbleDropdown = this.formBuilder.group({
      keyword: ['']
    });
  }
  ngOnInit() {
    this.list = this.items;
    console.log(this.list, this.items)
    this.temp_list = this.items;
  }
  ngOnChanges() {
    this._label = (typeof this.label !== 'undefined' && this.label !== '') ? this.label : 'name';
    this._img = (typeof this.img !== 'undefined' && this.img !== '') ? this.img : 'img';
    this._uid = (typeof this.uid !== 'undefined' && this.uid !== '') ? this.uid : 'id';
    this.value = 'Select';
  }
  writeValue(value:any) {
    console.log(value)
    if (value && this.temp_list !== undefined) {
      this.temp_list.map(x => {
        if (x[this._uid] == value) {
          this.value = x[this._label];
        }
      })
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  // search(e:any) {
  //
  //   const val = e.target.value.toLowerCase()//e.toLowerCase();
  //   console.log(val)
  //   const temp = this.temp_list.filter(x => {
  //     // @ts-ignore
  //     if (x[this._label].toLowerCase().indexOf(val) !== -1 || !val) {
  //       return x;
  //     }
  //   });
  //   this.list = temp;
  // }
  search(e:any) {
    const val = e.target.value.toLowerCase();
    if(this.temp_list !== undefined){
      this.list = this.temp_list.filter(x => {
        // @ts-ignore
        if (x[this._label].toLowerCase().indexOf(val) !== -1 || !val) {
          return x;
        }
      });
    }
    else{
      this.list = [];
    }

  }

  select(item:any) {
    this.onChange(item[this._label]);
    this.value = item[this._label];
    this.shown = false;
    this.afterChange.emit(item);
  }
  show() {
    this.shown = !this.shown;
    console.log('sdsdf')
    setTimeout(() => {
      this.input?.nativeElement.focus();
    }, 200);
  }
  @HostListener("document:click", ["$event"]) onClick(e:any) {
    if (!this.ele.nativeElement.contains(e.target)) {
      this.shown = false;
    }
  }
}
