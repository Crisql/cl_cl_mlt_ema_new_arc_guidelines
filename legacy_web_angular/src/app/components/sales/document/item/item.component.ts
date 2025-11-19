import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {FormControl} from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  startWith,
  Subject,
  Subscription,
  takeUntil,
} from "rxjs";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";
import Validation from "@app/custom-validation/custom-validators";
import { MatDialog } from '@angular/material/dialog';
import { ISearchModalComponentDialogData, SearchModalComponent } from '@clavisco/search-modal';
import { IItemMasterData } from '@app/interfaces/i-items';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, OnDestroy,OnChanges {
  @ViewChild('searchInput', {static: false}) searchInput!: ElementRef;
  @Input('display') display: boolean = false;
  @Input('items') items: ItemSearchTypeAhead[] = [];
  @Output('onItemSelected') onItemSelected = new EventEmitter<ItemSearchTypeAhead | string>();
  @Output('refresh') refresh = new EventEmitter();
  itemForm!: FormControl;
  items$!: Observable<ItemSearchTypeAhead[]>;
  itemSubject$ = new Subject<string>();
  frmSubject$ = new Subject<void>()
  subscription$!: Subscription;
  searchItemModalId = "searchItemModalId";

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(
    private sharedService: SharedService,
    private alertsService: AlertsService,
    private matDialog: MatDialog,
  ) {
    this.subscription$ = new Subscription();
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();

    this.itemSubject$.next('');
    this.itemSubject$.complete();
    this.frmSubject$.next();
    this.frmSubject$.complete();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.itemSubject$.next('');
  }

  private OnLoad(): void {

    this.itemForm = new FormControl(null);

    this.itemForm.addValidators(Validation.validateValueAutoComplete(this.items));

    if (this.display) {
      this.subscription$ = this.sharedService.focusItem$.subscribe(x => {
        this.searchInput.nativeElement.focus();
      });
    }

    this.items$ = this.itemSubject$.pipe(
      startWith(''),
      map(value => {
        return this.FilterItems(value);
      }),
    )

    this.itemForm.valueChanges.pipe(
      filter(res => {
        return !!res;
      }),
      filter(res => {
        return typeof res === 'string';
      }),
      distinctUntilChanged(),
      debounceTime(15),
      takeUntil(this.frmSubject$)
    ).subscribe({
      next: (res => {
        this.itemSubject$.next(res)
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });

    this.EnableItemForm();
  }

  public DisplayFnItem(_item: ItemSearchTypeAhead): string {
    return _item && Object.keys(_item).length ? `${_item.ItemCode} - ${_item.ItemName}` : '';
  }

  private FilterItems(_value: string | ItemSearchTypeAhead): ItemSearchTypeAhead[] {
    let item: ItemSearchTypeAhead[] = [];
    try {
      if (typeof _value !== 'string') {
        item = this.GetItems(_value.TypeAheadFormat);
      }
      if (typeof _value === 'string') {
        item = this.GetItems(_value);
      }

    } catch (error) {
    }
    return item;
  }

  public SelectItem(_item: ItemSearchTypeAhead): void {
    this.itemForm.disable()
    this.searchInput.nativeElement.blur();
    this.onItemSelected.emit(_item);
    this.itemForm.reset();
    this.itemSubject$.next('');
  }

  private GetItems(_term: string): ItemSearchTypeAhead[] {
    return this.items.filter((v) => {

      if (_term.indexOf('*') == -1) {
        return v.TypeAheadFormat.toLowerCase().indexOf(_term.toLowerCase()) > -1;
      }

      let a = v.TypeAheadFormat.toLowerCase();

      const stringSize = a.length;

      const t = _term.toLowerCase();

      const b = t.split("*").filter((x) => x !== "");

      const size = b.length;

      let isSorted = true;

      if (size > 1) {

        let indexes: number[] = [];

        for (let c = 0; c < size; c++) {

          b[c] = b[c].replace(' ', '');
          let ii = a.indexOf(b[c]);

          if (ii > -1) {
            ii++;

            a = a.slice(ii, stringSize);

            if (indexes.length > 0)
              indexes.push(indexes[indexes.length - 1] + ii);
            else indexes.push(ii);
          }
        }

        let sizeIndexes = indexes.length;

        if (sizeIndexes === size) {
          for (let c = 0; c < sizeIndexes - 1; c++) {
            if (indexes[c] > indexes[c + 1]) {
              isSorted = false;
              c = sizeIndexes;
            }
          }
          return isSorted;
        }
      }

      return (v.TypeAheadFormat.toLowerCase().indexOf(_term.toLowerCase()) > -1);

    }).sort((x, y) => x.TypeAheadFormat.toLowerCase()
      .indexOf(_term.toLowerCase()) - y.TypeAheadFormat.toLowerCase()
      .indexOf(_term.toLowerCase())
    ).slice(0, 50).sort((a, b) => b.OnHand - a.OnHand);
  }

  public RefreshItems(): void {
    this.refresh.emit();
  }

  public FindItem(_event: KeyboardEvent): void {

    if (_event.key === 'Enter' && this.display) {
      if (typeof this.itemForm.value === 'string') {
        let item = this.items.find(x => x.TypeAheadFormat.includes(this.itemForm.value));
        if(item){
          this.SelectItem(item);
        }else{
          this.searchInput.nativeElement.blur();
          this.onItemSelected.emit(this.itemForm.value)
          this.itemForm.reset();
          this.itemSubject$.next('');
          this.autocompleteTrigger.closePanel();
        }
      }
    } else if (_event.key === 'Enter' && this.itemForm.value) {
      let item = this.items.find(x => x.BarCode === this.itemForm.value);
      if (item) {
        this.SelectItem(item);
      } else {
        this.alertsService.Toast({type: CLToastType.INFO, message: `No existe ${this.itemForm.value}`});
        this.itemForm.reset();
        this.itemSubject$.next('');
      }
    }

  }

  private EnableItemForm(): void {
    this.sharedService.EnableItem.pipe(
      takeUntil(this.frmSubject$)
    ).subscribe({
      next: (res) => {
        this.itemForm.enable();
        // Se comenta para salir con Biotec
        // Se debe hacer configurable
        // this.searchInput.nativeElement.focus();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  ShowModalSearchItem(): void
  {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchItemModalId,
        ModalTitle: 'Lista ítems',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','ForeignName','ItemPrices','Series','TaxCode','ItemBarCodeCollection','Udfs','TaxRate',
          'UnitPrice','ItemClass','TypeAheadFormat','UoMEntry','UoMMasterData','ManBtchNum','ManSerNum','AbsEntry',
          'DistNumberLote','SysNumber','TypeAheadFormat','Device','DefaultWarehouse'],
          RenameColumns: {
            ItemCode: 'Codigo',
            ItemName: 'Nombre',
            BarCode: 'Código barras',
            OnHand: 'Disponible',
            BinCode: 'Ubicación',
            DistNumberSerie: 'Numero de Serie'
          }
        }
      } as ISearchModalComponentDialogData<ItemSearchTypeAhead>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if(value){
            this.SelectItem(value);
          }
        }
      });
  }

}
