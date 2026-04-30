import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Separator } from "@tanisya/ui/components/separator";

import Logo from "@/components/shadcn-studio/logo";

import LoginForm from "@/components/shadcn-studio/blocks/login/login-form";

const Login = () => {
  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <Logo className="gap-3" />

          <div>
            <CardTitle className="mb-1.5 text-2xl">Sign in to Tanisya</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {/* Login Form */}
          <div className="space-y-4">
            <LoginForm />

            <p className="text-muted-foreground text-center">
              New on our platform?{" "}
              <a href="/register" className="text-card-foreground hover:underline">
                Create an account
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
