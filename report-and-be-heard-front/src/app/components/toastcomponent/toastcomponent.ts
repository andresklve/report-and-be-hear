import { Component, inject } from '@angular/core';
import { Toastservice } from '../../services/toastservice';

@Component({
  selector: 'app-toasts',
  templateUrl: './toastcomponent.html',
})
export class Toastcomponent {
  tS = inject(Toastservice)
}
