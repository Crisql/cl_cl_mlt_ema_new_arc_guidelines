import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { VerifyUserTokenGuard } from './guards/verify-user-token.guard';
import { PrincipalComponentResolver } from './resolvers/principal-component.resolver';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/principal.module').then(m => m.PrincipalModule),
    canActivate: [VerifyUserTokenGuard],
    resolve: {resolvedData: PrincipalComponentResolver}
  },
  {
    path: 'login',
    loadChildren: () => import('./components/login-container/login-container.module').then(m => m.LoginContainerModule)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
