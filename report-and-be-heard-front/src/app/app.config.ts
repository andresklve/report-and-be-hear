import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsPE from '@angular/common/locales/es-PE';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptor } from './shared/authinterceptor';
import { PaginadorEs } from './shared/paginador';

registerLocaleData(localeEsPE)

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    // Angular Material: campos con borde y paginador en español
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
    { provide: MatPaginatorIntl, useClass: PaginadorEs },
    // Selector de fechas (mat-datepicker) en español
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
  ]
};
