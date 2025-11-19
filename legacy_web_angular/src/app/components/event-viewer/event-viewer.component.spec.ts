import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventViewerComponent } from './event-viewer.component';
import {MatDialogModule} from "@angular/material/dialog";
import {RouterTestingModule} from "@angular/router/testing";
import {OverlayModule} from "@clavisco/overlay";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {LinkerService} from "@clavisco/linker";
import {FormBuilder} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";
import { IActionButton } from '@app/interfaces/i-action-button';
import {Event} from "@app/enums/enums";


describe('EventViewerComponent', () => {
  let component: EventViewerComponent;
  let fixture: ComponentFixture<EventViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventViewerComponent ],
      imports: [OverlayModule, MatDialogModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: 'LinkerService',
          useExisting: LinkerService
        },
        FormBuilder
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


it('should call SearchLogEvents when action button is SEARCH', () => {
    // Arrange
    spyOn(component, 'SearchLogEvents'); // Espiar el método SearchLogEvents
    const actionButton: IActionButton = { Key: 'SEARCH' }; // Simular un botón de acción

    // Act
    component.OnActionButtonClicked(actionButton);

    // Assert
    expect(component.SearchLogEvents).toHaveBeenCalled(); // Verificar que se haya llamado al método
  });

  it('should not call SearchLogEvents for other action buttons', () => {
    // Arrange
    spyOn(component, 'SearchLogEvents'); // Espiar el método
    const actionButton: IActionButton = { Key: 'OTHER_ACTION' }; // Botón de acción diferente

    // Act
    component.OnActionButtonClicked(actionButton);

    // Assert
    expect(component.SearchLogEvents).not.toHaveBeenCalled(); // Verificar que NO se haya llamado al método
  });
//--
  it('should return "cancel" for Event.Error', () => {
    const result = component.EventIcon(Event.Error);
    expect(result).toBe('cancel');
  });

  it('should return "error" for Event.Information', () => {
    const result = component.EventIcon(Event.Information);
    expect(result).toBe('error');
  });

  it('should return "check_circle" for Event.Success', () => {
    const result = component.EventIcon(Event.Success);
    expect(result).toBe('check_circle');
  });

  it('should return "warning" for Event.Warning', () => {
    const result = component.EventIcon(Event.Warning);
    expect(result).toBe('warning');
  });

  it('should return "lens" for unknown event', () => {
    const result = component.EventIcon('unknown' as Event); 
    expect(result).toBe('lens');
  });
//--

it('should return "error" for Event.Error', () => {
  const result = component.EventColor(Event.Error);
  expect(result).toBe('error');
});

it('should return "information" for Event.Information', () => {
  const result = component.EventColor(Event.Information);
  expect(result).toBe('information');
});

it('should return "success" for Event.Success', () => {
  const result = component.EventColor(Event.Success);
  expect(result).toBe('success');
});

it('should return "warning" for Event.Warning', () => {
  const result = component.EventColor(Event.Warning);
  expect(result).toBe('warning');
});

it('should return "black" for unknown event', () => {
  const result = component.EventColor('unknown' as Event); 
  expect(result).toBe('black');
});
//--

it('should return "Error" for Event.Error', () => {
  const result = component.EventDescription(Event.Error);
  expect(result).toBe('Error');
});

it('should return "Información" for Event.Information', () => {
  const result = component.EventDescription(Event.Information);
  expect(result).toBe('Información');
});

it('should return "Éxito" for Event.Success', () => {
  const result = component.EventDescription(Event.Success);
  expect(result).toBe('Éxito');
});

it('should return "Advertencia" for Event.Warning', () => {
  const result = component.EventDescription(Event.Warning);
  expect(result).toBe('Advertencia');
});

it('should return "Todos" for unknown event', () => {
  const result = component.EventDescription('unknown' as string); 
  expect(result).toBe('Todos');
});


});
