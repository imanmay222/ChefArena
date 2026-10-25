import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/auth/roles";

// The mock session lives in the browser, so the server cannot see it. Everyone
// goes to /login, which forwards an existing session to its role's workspace.
export default function Home() {
  redirect(LOGIN_ROUTE);
}
