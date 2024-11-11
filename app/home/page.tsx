import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AiChat } from '@/components/ai-chat';

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center">
      <div className="w-full max-w-3xl px-4">
        {/* <h1 className="text-3xl font-bold mb-8">AI Chat</h1> */}
        <AiChat />
      </div>
    </div>
  );
}
