import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HomepageComponent } from "./homepage/homepage.component";
import { GrundlagenComponent } from "./grundlagen/grundlagen.component";

import { ResolutionTheoryComponent } from "./cnf-procedures/resolution-procedure/theory/resolution-theory.component";
import { ResolutionExampleComponent } from "./cnf-procedures/resolution-procedure/example/resolution-example.component";
import { ResolutionTestComponent } from "./cnf-procedures/resolution-procedure/test/resolution-test.component";
import { ResolutionExerciseComponent } from "./cnf-procedures/resolution-procedure/exercise/resolution-exercise.component";

import { DpllTheoryComponent } from "./cnf-procedures/dpll-procedure/theory/dpll-theory.component";
import { DpllExampleComponent } from "./cnf-procedures/dpll-procedure/example/example.component";
import { DpllTestComponent } from "./cnf-procedures/dpll-procedure/test/dpll-test.component";
import { DpllExerciseComponent } from "./cnf-procedures/dpll-procedure/exercise/exercise.component";

import { TableauTheoryComponent } from "./tableauprocedure/theory/tableau-theory.component";
import { TableauExampleComponent } from "./tableauprocedure/example/tableau-example.component";
import { TableauTestComponent } from "./tableauprocedure/test/tableau-test.component";
import { TableauExerciseComponent } from "./tableauprocedure/exercise/tableau-exercise.component";

// Routes to the single pages
const appRoutes: Routes = [
    
    { path: '', component: HomepageComponent },
    { path: '', redirectTo: '/homepage', pathMatch: 'full' },
    { path: 'homepage', component: HomepageComponent },

    { path: 'grundlagen', component: GrundlagenComponent },

    { path: 'resolution-theory', component: ResolutionTheoryComponent },
    { path: 'resolution-example', component: ResolutionExampleComponent },
    { path: 'resolution-test', component: ResolutionTestComponent },
    { path: 'resolution-exercise', component: ResolutionExerciseComponent },

    { path: 'tableau-theory', component: TableauTheoryComponent },
    { path: 'tableau-example', component: TableauExampleComponent },
    { path: 'tableau-test', component: TableauTestComponent },
    { path: 'tableau-exercise', component: TableauExerciseComponent },

    { path: 'dpll-theory', component: DpllTheoryComponent },
    { path: 'dpll-example', component: DpllExampleComponent },
    { path: 'dpll-test', component: DpllTestComponent },
    { path: 'dpll-exercise', component: DpllExerciseComponent },
];

/**
 * This class will provide the routing ability through the main pages.
 */
@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
