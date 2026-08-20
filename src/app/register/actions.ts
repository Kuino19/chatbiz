"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Missing required fields" };
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return { error: "User already exists with this email" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      business: {
        create: {
          name: `${name}'s Shop`,
        }
      }
    }
  });

  redirect("/login?registered=true");
}
