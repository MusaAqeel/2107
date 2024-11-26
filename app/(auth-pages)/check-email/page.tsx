import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Information } from "@/components/ui/information";
import { createClient } from "@/utils/supabase/server";
import { resendVerificationEmail } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    email?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function CheckEmail({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params?.email;
  const error = params?.error;
  const success = params?.success;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not logged in or email is not confirmed, show verification UI
  const isEmailVerified = user?.email_confirmed_at;
  
  if (!email && !user?.email) {
    console.log('tobytoby1');
    redirect('/sign-up');
  }
  console.log('tobytoby2');
  console.log({ email, user: user?.email, isEmailVerified });

  return (
    
    <div className="flex flex-col min-w-64 max-w-64 mx-auto gap-6">
      <h1 className="text-2xl font-medium">Check your email</h1>
      <Information
        data-testid="info"
        title="Confirmation Required"
        message={`We've sent you an email with a confirmation link to ${email || user?.email}. Please check your inbox and click the link to verify your account.`
        }
      />

      <div className="flex flex-col gap-4">
        {!isEmailVerified ? (
          <form className="flex flex-col gap-4">
            <input type="hidden" name="email" value={email || user?.email || ''} />
            <SubmitButton 
              formAction={resendVerificationEmail} 
              variant="outline"
              pendingText="Sending..."
              data-testid="submit"
            >
              Resend verification email
            </SubmitButton>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-500">{success}</p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Already verified? {" "}
              <Link href="/sign-in" className="text-primary underline" data-testid="link">
                Sign in
              </Link>
            </p>
          </form>
        ) : null}
      </div>
    </div>
  );
} 