const LS_API = "https://api.lemonsqueezy.com/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
  };
}

export async function createLSCheckout({
  storeId,
  variantId,
  userId,
  credits,
  redirectUrl,
}: {
  storeId: string;
  variantId: string;
  userId: string;
  credits: number;
  redirectUrl: string;
}): Promise<string> {
  const res = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: { userId, credits: String(credits) },
          },
          product_options: {
            redirect_url: redirectUrl,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lemon Squeezy checkout failed: ${err}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}
