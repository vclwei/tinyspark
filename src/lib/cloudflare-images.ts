export async function getDirectUploadUrl(accountId: string, apiToken: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  const data = await res.json() as {
    success: boolean;
    result: { id: string; uploadURL: string };
  };
  if (!data.success) {
    throw new Error("Failed to get upload URL");
  }
  return data.result;
}

export async function deleteImage(imageId: string, accountId: string, apiToken: string) {
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
}

export function getImageUrl(accountHash: string, imageId: string, variant: "thumbnail" | "medium" | "full" | "avatar") {
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}
