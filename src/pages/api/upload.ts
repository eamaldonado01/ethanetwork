// ──────────────────────────────────────
//  /api/upload  – returns a signed S3 PUT URL
// ──────────────────────────────────────
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Only *required* vars – access keys are optional in ECS/Fargate           */
const { S3_REGION, S3_BUCKET } = process.env;

/** Keep Next.js JSON body parser so `req.body` is already an object         */
export const config = { api: { bodyParser: true } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  /* —— env sanity-check —— */
  if (!S3_REGION || !S3_BUCKET) {
    return res
      .status(500)
      .json({ error: 'S3_BUCKET and/or S3_REGION not set in env' });
  }

  try {
    const { fileName, fileType } = req.body as {
      fileName?: string;
      fileType?: string;
    };

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName & fileType required' });
    }

    /** IAM role on the task will supply credentials automatically            */
    const s3 = new S3Client({ region: S3_REGION });
    const key = `${Date.now()}-${fileName}`;

    const put = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, put, { expiresIn: 60 });

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
