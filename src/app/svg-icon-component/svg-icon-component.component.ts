import {Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'app-svg-icon-component',
  templateUrl: './svg-icon-component.component.html',
  styleUrls: ['./svg-icon-component.component.scss']
})
export class SvgIconComponentComponent {

  @HostBinding('style.-webkit-mask-image')
  private _path!: string;

  @Input()
  public set path(filePath: string) {
    this._path = `url("${filePath}")`;
  }
}



