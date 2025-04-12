import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkToSalesComponent } from './talk-to-sales.component';

describe('TalkToSalesComponent', () => {
  let component: TalkToSalesComponent;
  let fixture: ComponentFixture<TalkToSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalkToSalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TalkToSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
