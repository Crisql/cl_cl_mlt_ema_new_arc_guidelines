import {IStructures} from "@app/interfaces/i-structures";

export const regexEmail: string = '^[\\w\\.-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z]{2,})+$';
export const DAYS_OF_WEEK: IStructures[] = [
  {
    Key: '-1',
    Description: 'Todos',
    Default: false,
    Prop1: 'N', // Selected (Y | N)
    Prop2: ''
  },
  {
    Key: '0',
    Description: 'Domingo',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  },
  {
    Key: '1',
    Description: 'Lunes',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  },
  {
    Key: '2',
    Description: 'Martes',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  },
  {
    Key: '3',
    Description: 'Miercoles',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  },
  {
    Key: '4',
    Description: 'Jueves',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  },
  {
    Key: '5',
    Description: 'Viernes',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  },
  {
    Key: '6',
    Description: 'Sábado',
    Default: false,
    Prop1: 'N',
    Prop2: ''
  }
];

