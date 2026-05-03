import { detectLanguage, isAppLang } from './language';

describe('detectLanguage', () => {
  it('prefers the saved choice', () => {
    expect(detectLanguage('en', ['pt-BR'])).toBe('en');
    expect(detectLanguage('pt-BR', ['en-US'])).toBe('pt-BR');
  });

  it('ignores unsupported saved values', () => {
    expect(detectLanguage('fr', ['en-GB'])).toBe('en');
    expect(detectLanguage('', ['pt'])).toBe('pt-BR');
  });

  it('maps any Portuguese or English browser language', () => {
    expect(detectLanguage(null, ['pt-PT'])).toBe('pt-BR');
    expect(detectLanguage(null, ['en-AU'])).toBe('en');
    expect(detectLanguage(null, ['de-DE', 'en-US', 'pt-BR'])).toBe('en');
  });

  it('falls back to pt-BR', () => {
    expect(detectLanguage(null, [])).toBe('pt-BR');
    expect(detectLanguage(null, ['es-ES', 'ja'])).toBe('pt-BR');
  });

  it('guards the supported languages', () => {
    expect(isAppLang('en')).toBeTrue();
    expect(isAppLang('en-US')).toBeFalse();
    expect(isAppLang(42)).toBeFalse();
  });
});
