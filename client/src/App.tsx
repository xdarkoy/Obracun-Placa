import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import Employees from "./pages/Employees";
import Contracts from "./pages/Contracts";
import PayrollRuns from "./pages/PayrollRuns";
import PayrollDetails from "./pages/PayrollDetails";
import TaxRules from "./pages/TaxRules";
import WageTypes from "./pages/WageTypes";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/tenants"} component={Tenants} />
      <Route path={"/employees/:tenantId"} component={Employees} />
      <Route path={"/contracts/:employeeId"} component={Contracts} />
      <Route path={"/payroll/:tenantId"} component={PayrollRuns} />
      <Route path={"/payroll/:tenantId/:runId"} component={PayrollDetails} />
      <Route path={"/tax-rules"} component={TaxRules} />
      <Route path={"/wage-types"} component={WageTypes} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
