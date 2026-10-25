import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UploadForm from "./UploadForm";

export const runtime = "nodejs";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/api/auth/signin?callbackUrl=%2Fupload");
  }

  const allowedEmail = process.env.UPLOAD_ALLOWED_EMAIL
    ?.trim()
    .toLowerCase();

  const signedInEmail = session.user.email.trim().toLowerCase();

  if (!allowedEmail) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">
          Upload is not configured
        </h1>
        <p className="mt-3">
          Set UPLOAD_ALLOWED_EMAIL in your environment.
        </p>
      </main>
    );
  }

  if (signedInEmail !== allowedEmail) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3">
          This Google account is not allowed to upload articles.
        </p>
        <p className="mt-2 text-sm">
          Signed in as: {session.user.email}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-semibold">
        Upload an article
      </h1>
      <UploadForm />
    </main>
  );
}
