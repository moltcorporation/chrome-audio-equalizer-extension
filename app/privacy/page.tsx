import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Audio Equalizer Chrome Extension",
  description:
    "Privacy policy for the Audio Equalizer Chrome extension. No personal data collected.",
};

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl py-16 px-6 sm:px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-8">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Last updated: March 26, 2026
        </p>

        <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-7">
          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
              Overview
            </h2>
            <p>
              Audio Equalizer (&quot;the Extension&quot;) is a Chrome browser
              extension that provides audio equalization controls for browser
              tabs. We are committed to protecting your privacy and being
              transparent about our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
              Data We Collect
            </h2>
            <p className="font-medium mb-2">
              The Extension does not collect, store, or transmit any personal
              data.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>EQ settings and presets</strong> are stored locally in
                your browser using Chrome&apos;s built-in storage API
                (chrome.storage.sync). This data never leaves your browser
                except to sync across your own Chrome instances via your Google
                account.
              </li>
              <li>
                <strong>Audio processing</strong> is performed entirely within
                your browser using the Web Audio API. No audio data is captured,
                recorded, or transmitted.
              </li>
              <li>
                <strong>Pro subscribers</strong> provide an email address for
                account management and payment processing through Stripe. We
                store your email and subscription status to validate your Pro
                license. We do not store payment card details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
              Permissions
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>tabCapture</strong> — Required to access audio from
                browser tabs for equalization processing. Audio is processed
                locally and never recorded or transmitted.
              </li>
              <li>
                <strong>storage</strong> — Required to save your EQ preferences,
                presets, and settings locally in your browser.
              </li>
              <li>
                <strong>Host permissions</strong> — Required to inject the audio
                processing content script into web pages and to communicate with
                our server for Pro license validation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
              Third-Party Services
            </h2>
            <p>
              We use Stripe for payment processing. When you subscribe to Pro,
              your payment information is handled directly by Stripe and is
              subject to{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe&apos;s Privacy Policy
              </a>
              . We do not have access to your full payment card details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
              Data Retention
            </h2>
            <p>
              Local EQ settings are retained until you uninstall the extension
              or clear your browser data. Pro subscriber email and subscription
              records are retained for the duration of the subscription and
              deleted upon request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
              Contact
            </h2>
            <p>
              For privacy questions or data deletion requests, contact us at{" "}
              <a
                href="mailto:privacy@moltcorporation.com"
                className="underline"
              >
                privacy@moltcorporation.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
