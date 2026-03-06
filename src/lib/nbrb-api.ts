const NBRB_BASE = "https://api.nbrb.by/exrates";

export interface NBRBRate {
  Cur_ID: number;
  Date: string;
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_Name: string;
  Cur_OfficialRate: number;
}

export async function fetchNBRBRates(): Promise<{
  USD: number;
  RUB: number;
}> {
  const [usdRes, rubRes] = await Promise.all([
    fetch(`${NBRB_BASE}/rates/USD?parammode=2`),
    fetch(`${NBRB_BASE}/rates/RUB?parammode=2`),
  ]);

  if (!usdRes.ok || !rubRes.ok) {
    throw new Error("Failed to fetch NBRB exchange rates");
  }

  const [usdData, rubData] = (await Promise.all([
    usdRes.json(),
    rubRes.json(),
  ])) as [NBRBRate, NBRBRate];

  // NBRB: USD = BYN per 1 USD; RUB = BYN per 100 RUB
  const usdRate = usdData.Cur_OfficialRate;
  const rubRate = rubData.Cur_OfficialRate / (rubData.Cur_Scale || 100);

  return {
    USD: usdRate,
    RUB: rubRate,
  };
}
