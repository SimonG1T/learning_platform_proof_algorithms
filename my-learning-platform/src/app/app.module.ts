import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { HomepageComponent } from './homepage/homepage.component';
import { HeaderComponent } from './header/header.component';
import { GrundlagenComponent } from './grundlagen/grundlagen.component';
import { GrammatikenGrundlagen, BeweiseGrundlagen, SchlussregelnGrundlagen } from './grundlagen/files/grundlagen-files';

import { LatexParagraphComponent } from './latex/latex-paragraph/latex-paragraph.component';
import { LatexViewerComponent } from './latex/latex-viewer/latex-viewer.component';
import { DisplayFeedbackComponent } from './feedback/display-feeback.component';

import { ResolutionTheoryComponent, ResolutionSummaryComponent } from './cnf-procedures/resolution-procedure/theory/resolution-theory.component';
import { ResolutionExampleComponent } from './cnf-procedures/resolution-procedure/example/resolution-example.component';
import { ResolutionTestComponent } from './cnf-procedures/resolution-procedure/test/resolution-test.component';
import { ResolutionExerciseComponent } from './cnf-procedures/resolution-procedure/exercise/resolution-exercise.component';

import { TableauTheoryComponent, TableauSummaryComponent, TableauRulesComponent } from './tableauprocedure/theory/tableau-theory.component';
import { TableauExampleComponent } from './tableauprocedure/example/tableau-example.component';
import { TableauTestComponent } from './tableauprocedure/test/tableau-test.component';
import { TableauExerciseComponent } from './tableauprocedure/exercise/tableau-exercise.component';

import { DpllTheoryComponent, DpllSummaryComponent } from './cnf-procedures/dpll-procedure/theory/dpll-theory.component';
import { DpllExampleComponent } from './cnf-procedures/dpll-procedure/example/example.component';
import { DpllTestComponent } from './cnf-procedures/dpll-procedure/test/dpll-test.component';
import { DpllExerciseComponent } from './cnf-procedures/dpll-procedure/exercise/exercise.component';


/**
 * AppModule is the root module of the Angular application.
 * 
 * It defines the main components, directives, services, and other modules
 * that are required to bootstrap
 * and run the application.
 */
@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        GrundlagenComponent,
        DpllExampleComponent,
        ResolutionTestComponent,
        GrammatikenGrundlagen,
        BeweiseGrundlagen,
        SchlussregelnGrundlagen,
        ResolutionExampleComponent,
        TableauExampleComponent,
        HomepageComponent,
        LatexViewerComponent,
        TableauTestComponent,
        DpllTestComponent,
        DpllExerciseComponent,
        ResolutionExerciseComponent,
        TableauExerciseComponent,
        DisplayFeedbackComponent,
        ResolutionTheoryComponent,
        TableauTheoryComponent,
        DpllTheoryComponent,
        ResolutionSummaryComponent,
        TableauSummaryComponent,
        DpllSummaryComponent,
        TableauRulesComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LatexParagraphComponent
    ],
    providers: [
        provideAnimationsAsync()
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
