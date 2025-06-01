// Very small helper – no React imports
export async function uploadFile(file: File): Promise<string> {
  // 1️⃣  ask Next API for a signed PUT URL
  const sign = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  }).then((r) => r.json());

  if (!sign?.url || !sign?.publicUrl) {
    throw new Error('Could not obtain signed S3 URL');
  }

  // 2️⃣  PUT the file directly to S3
  await fetch(sign.url, { method: 'PUT', body: file });

  // 3️⃣  return the public https://… URL for the GraphQL mutation
  return sign.publicUrl as string;
}
