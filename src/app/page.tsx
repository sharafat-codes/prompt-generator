import { redirect } from "next/navigation";

export default function Home() {
  // The library is home. (Auth gate will slot in here later.)
  redirect("/library");
}
