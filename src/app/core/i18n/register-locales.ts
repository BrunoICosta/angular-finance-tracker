import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// `en` (en-US) ships with Angular; Portuguese has to be registered once.
registerLocaleData(localePt, 'pt-BR');
