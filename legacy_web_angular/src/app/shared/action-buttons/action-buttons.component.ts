import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CLPrint } from '@clavisco/core';
import { CL_DISPLAY } from '@clavisco/linker';
import { IActionButton } from 'src/app/interfaces/i-action-button';
import { SharedService } from '../shared.service';
import {FormGroup} from "@angular/forms";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {Action} from "rxjs/internal/scheduler/Action";

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent implements OnInit, AfterViewInit {

  @Input() actionButtons: IActionButton[] = [];
  @Input() isIntoMatTab: boolean = true;
  @Input() form?: FormGroup;
  @Input() userPermissions: IPermissionbyUser[] = [];

  @Output() onActionButtonClicked: EventEmitter<IActionButton> = new EventEmitter<IActionButton>();
  constructor(private sharedService: SharedService) { }

  ngAfterViewInit(): void {
    if(this.isIntoMatTab) this.sharedService.PageInit();
  }
  ngOnInit(): void {
    if(!this.actionButtons || !this.actionButtons.length)
    {
      CLPrint('No action buttons was provide', CL_DISPLAY.WARNING);
      this.actionButtons = [];
    }
  }

  EmitActionButtonClickEvent(_actionButton: IActionButton): void
  {
    this.onActionButtonClicked.emit(_actionButton);
  }
}
