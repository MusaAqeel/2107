import { completeProfileAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CompleteProfile(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <form className="flex flex-col min-w-64 max-w-64 mx-auto">
      <h1 className="text-2xl font-medium">Complete Your Profile</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Please provide your name to complete your profile setup.
      </p>
      
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="firstName">First Name</Label>
        <Input 
          name="firstName" 
          placeholder="John"
          required 
        />
        
        <Label htmlFor="lastName">Last Name</Label>
        <Input 
          name="lastName" 
          placeholder="Doe"
          required 
        />

        <SubmitButton 
          formAction={completeProfileAction} 
          pendingText="Saving..."
        >
          Complete Profile
        </SubmitButton>
        
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
} 