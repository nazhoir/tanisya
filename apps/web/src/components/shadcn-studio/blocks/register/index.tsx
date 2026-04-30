import { Button } from "@tanisya/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tanisya/ui/components/card";
import { Separator } from "@tanisya/ui/components/separator";

import Logo from "@/components/shadcn-studio/logo";

import RegisterForm from "@/components/shadcn-studio/blocks/register/register-form";

const Register = () => {
  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <Logo className="gap-3" />

          <div>
            <CardTitle className="mb-1.5 text-2xl">Sign Up to Tanisya</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {/* Register Form */}
          <div className="space-y-4">
            <RegisterForm />

            <p className="text-muted-foreground text-center">
              Already have an account?{" "}
              <a href="/login" className="text-card-foreground hover:underline">
                Sign in instead
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
