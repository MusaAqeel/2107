import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Information } from "@/components/ui/information";
import { createClient } from "@/utils/supabase/server";
import { resendVerificationEmail } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage, Message } from "@/components/form-message";

export default async function CheckEmail(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not logged in or email is not confirmed, show verification UI
  const isEmailVerified = user?.email_confirmed_at;

  return (
    <div className="flex flex-col min-w-64 max-w-64 mx-auto gap-6">
      <h1 className="text-2xl font-medium">Check your email</h1>
      
      <Information
        title="Confirmation Required"
        message="We've sent you an email with a confirmation link. Please check your inbox and click the link to verify your account."
      />

      <div className="flex flex-col gap-4">
        {!isEmailVerified ? (
          <form className="flex flex-col gap-4">
            <SubmitButton 
              formAction={resendVerificationEmail} 
              variant="outline"
              pendingText="Sending..."
            >
              Resend verification email
            </SubmitButton>
            <FormMessage message={searchParams} />
            <p className="text-sm text-muted-foreground text-center">
              Already verified? {" "}
              <Link href="/sign-in" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <Button asChild variant="default">
            <Link href="/sign-in">Continue to sign in</Link>
          </Button>
        )}
      </div>
    </div>
  );
} 