import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const { data } = await req.json();

  const {
    id,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    email_addresses,
  } = data;
  const email = email_addresses[0].email_address;

  await db.user.create({
    data: {
      id,
      firstName,
      lastName,
      imageUrl,
      email,
    }
  })

  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}