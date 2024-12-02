import { getUser } from "@/lib/queries";
import { LoginForm, SignInSignUp, SignOut } from "./auth.client";

export async function AuthServer() {
  const user = await getUser();
  // TODO: Could dynamic load the sign-in/sign-up and sign-out components as they're not used on initial render
  if (!user) {
    return <SignInSignUp />;
  }
  return <SignOut username={user.username} />;
}

export async function PlaceOrderAuth() {
  const user = await getUser();
  if (user) {
    return null;
  }
  return (
    <>
      <p className="font-semibold text-accent1">Log in to place an order</p>
      <LoginForm />
    </>
  );
}
