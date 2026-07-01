import { CreateWorkspace } from "@/components/create/create-workspace";
import { hasApiKey } from "@/lib/ai/provider";

export default function CreatePage() {
  return <CreateWorkspace live={hasApiKey()} />;
}
