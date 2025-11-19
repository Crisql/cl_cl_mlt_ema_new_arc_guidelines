import {EnvironmentType} from "@app/enums/enums";

/**
 * @file Setting up the production environment
 * @description This file defines the production environment settings for Aromas.
 */
export const environment = {
  production: true,
  apiUrl: 'https://emaaromasapi.clavisco.com/',
  name: `Aromas`,
  type: EnvironmentType.Production,
  env: 'Production',
  recatchaSiteKey: '6LcMlsIpAAAAAKBfVDv-HijjIAiyEvsmPzlcTDZE',
  LogRocketId: ''
};
