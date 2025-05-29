// ──────────────────────────────────────
//  /api/upload  – returns a pre-signed S3 PUT URL
// ──────────────────────────────────────
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const { S3_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
  process.env;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  /* sanity-check env */
  if (
    !S3_REGION ||
    !S3_BUCKET ||
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY
  ) {
    return res.status(500).json({
      error: 'S3 env vars missing — check S3_REGION, S3_BUCKET, AWS creds',
    });
  }

  try {
    const { fileName, fileType } = JSON.parse(req.body ?? '{}');
    if (!fileName || !fileType)
      return res.status(400).json({ error: 'fileName & fileType required' });

    const s3 = new S3Client({ region: S3_REGION });
    const key = `${Date.now()}-${fileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
    });

    const url = await getSignedUrl(s3, putCommand, { expiresIn: 60 });
    return res.status(200).json({
      url,
      key,
      publicUrl: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`,
    });
  } catch (err) {
    console.error('upload-sign error', err);
    res.status(500).json({ error: 'internal-error' });
  }
}
