import { ClerkProvider, SignIn, SignUp, Show } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Repositories from "./pages/repositories";
import RepositoryDetail from "./pages/repository-detail";
import Services from "./pages/services";
import Pricing from "./pages/pricing";
import Launch from "./pages/launch";
import Settings from "./pages/settings";
import CloudAccounts from "./pages/cloud-accounts";
import Admin from "./pages/admin";
import NotFound from "./pages/not-found";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.png`,
  },
  variables: {
    colorPrimary: "hsl(190, 90%, 50%)",
    colorForeground: "hsl(210, 40%, 98%)",
    colorMutedForeground: "hsl(215, 20%, 65%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(230, 40%, 6%)",
    colorInput: "hsl(230, 40%, 12%)",
    colorInputForeground: "hsl(210, 40%, 98%)",
    colorNeutral: "hsl(230, 40%, 20%)",
    fontFamily: "'Outfit', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[hsl(230,40%,8%)] border border-[hsl(230,40%,16%)] rounded-xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function Protected({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      afterSignOutUrl={basePath + "/"}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard" component={() => <Protected component={Dashboard} />} />
            <Route path="/repositories" component={() => <Protected component={Repositories} />} />
            <Route path="/repositories/:id" component={() => <Protected component={RepositoryDetail} />} />
            <Route path="/services" component={() => <Protected component={Services} />} />
            <Route path="/launch" component={() => <Protected component={Launch} />} />
            <Route path="/settings" component={() => <Protected component={Settings} />} />
            <Route path="/cloud-accounts" component={() => <Protected component={CloudAccounts} />} />
            <Route path="/admin" component={() => <Protected component={Admin} />} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
