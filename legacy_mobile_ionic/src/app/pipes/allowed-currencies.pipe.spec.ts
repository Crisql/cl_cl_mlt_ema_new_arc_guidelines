import { AllowedCurrenciesPipe } from './allowed-currencies.pipe';

describe('AllowedCurrenciesPipe', () => {
  it('create an instance', () => {
    const pipe = new AllowedCurrenciesPipe();
    expect(pipe).toBeTruthy();
  });
});
