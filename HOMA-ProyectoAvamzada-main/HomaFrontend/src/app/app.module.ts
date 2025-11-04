
import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"
import { ReactiveFormsModule } from "@angular/forms"

import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component"
import { CoreModule } from "./core/core.module"
import { SharedModule } from "./shared/shared.module"
import { JwtInterceptor } from "./core/interceptors/jwt.interceptor"
import { ErrorInterceptor } from "./core/interceptors/error.interceptor"
import { LayoutsModule } from "./layouts/layouts.module"

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    LayoutsModule,
  
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

