import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtoboardTheveninNorton } from './protoboard-thevenin-norton';

describe('ProtoboardTheveninNorton', () => {
  let component: ProtoboardTheveninNorton;
  let fixture: ComponentFixture<ProtoboardTheveninNorton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtoboardTheveninNorton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtoboardTheveninNorton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
