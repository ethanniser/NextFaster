"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { validatedAction } from "@/lib/middleware";
import { db } from "@/db";
import { NewUser, users } from "@/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/session";
import { authRateLimit, signUpRateLimit } from "@/lib/rate-limit";

const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const signUp = validatedAction(authSchema, async (data) => {
  const { username, password } = data;
  const ip = (await headers()).get("x-real-ip") ?? "local";
  const rl2 = await signUpRateLimit.limit(ip);
  if (!rl2.success) {
    return {
      error: {
        code: "AUTH_ERROR",
        message: "Too many signups. Try again later",
      },
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: "Username already taken. Please try again." };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    username,
    passwordHash,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: "Failed to create user. Please try again." };
  }
  await setSession(createdUser);
});

export const signIn = validatedAction(authSchema, async (data) => {
  const { username, password } = data;
  const ip = (await headers()).get("x-real-ip") ?? "local";
  const rl = await authRateLimit.limit(ip);

  if (!rl.success) {
    return {
      error: {
        code: "AUTH_ERROR",
        message: "Too many attempts. Try again later",
      },
    };
  }
  const user = await db
    .select({
      user: users,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user.length === 0) {
    return { error: "Invalid username or password. Please try again." };
  }

  const { user: foundUser } = user[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return { error: "Invalid username or password. Please try again." };
  }
  await setSession(foundUser);
});

export async function signOut() {
  // clear session & cart
  const c = await cookies();
  c.getAll().forEach((cookie) => c.delete(cookie.name));
}
