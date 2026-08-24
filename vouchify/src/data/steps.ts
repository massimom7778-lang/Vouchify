/**
 * Setup is an actual sequence, so it is numbered. Nothing else on the site is.
 */
export interface SetupStep {
  readonly n: number;
  readonly title: string;
  readonly body: string;
  readonly detail: string;
}

export const setupSteps: readonly SetupStep[] = [
  {
    n: 1,
    title: 'Send us your review link',
    body: 'Paste it at checkout, or reply to the order email if you need to find it first.',
    detail:
      'It is the short link Google gives you under “Ask for reviews” in your Business Profile. If you cannot find it, send us your business name and city and we will look it up.',
  },
  {
    n: 2,
    title: 'We program and ship',
    body: 'Every chip is encoded and tested before it leaves, so nothing arrives blank.',
    detail:
      'Orders go out in 1–2 business days. Each stand is tapped on both an iPhone and an Android handset as part of packing.',
  },
  {
    n: 3,
    title: 'Put it where people stop',
    body: 'Counter first, pay terminal second. It works the moment you take it out of the box.',
    detail:
      'No pairing, no app, no account for your staff to remember. If you later want the link to point somewhere else, change it from your dashboard.',
  },
];
