import {EnvironmentType} from "@app/enums/enums";

/**
  * @file Setting up the development environment
  * @description This file defines the development environment settings for Aromas.
 */
export const environment = {
  production: false,
  apiUrl: 'https://emaaromasapidev.clavisco.com/',
  name: `Aromas`,
  type: EnvironmentType.Development,
  env: 'Development',
  recatchaSiteKey: '6LcMlsIpAAAAAKBfVDv-HijjIAiyEvsmPzlcTDZE',
  LogRocketId: ''
};
