const CWS_URL =
  "https://chromewebstore.google.com/detail/audio-equalizer-10-band-eq/PLACEHOLDER_CWS_ID";

function HeroSection() {
  return (
    <section className="px-6 py-24 text-center">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
        10-Band Audio Equalizer for Chrome
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
        Boost bass, sharpen treble, and fine-tune any audio in your browser.
        8 built-in presets, volume boost up to 200%, and per-tab control.
        Free to use.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-zinc-700 transition-colors"
        >
          Add to Chrome &mdash; Free
        </a>
      </div>
    </section>
  );
}

const features = [
  {
    title: "10-Band Equalizer",
    description:
      "Precise control from 31Hz to 16kHz with \u00B112dB range per band. Shape your sound exactly how you like it.",
  },
  {
    title: "Volume Boost",
    description:
      "Amplify quiet audio up to 200% (+20dB). Perfect for low-volume videos, podcasts, and streams.",
  },
  {
    title: "Bass & Treble Boost",
    description:
      "Dedicated presets for bass and treble enhancement, plus Rock, Pop, Jazz, Classical, and Vocal modes.",
  },
  {
    title: "8 Built-in Presets",
    description:
      "Flat, Bass Boost, Treble Boost, Vocal, Rock, Pop, Jazz, and Classical. One click to great sound.",
  },
  {
    title: "Per-Tab Control",
    description:
      "Different EQ settings for different tabs. Music in one tab, podcast in another, each with its own profile.",
  },
  {
    title: "Works Everywhere",
    description:
      "Any website with audio or video \u2014 YouTube, Spotify, Twitch, Netflix, podcasts, and more.",
  },
];

function FeaturesSection() {
  return (
    <section className="bg-zinc-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">
          Full Control Over Your Browser Audio
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600">
          Everything you need to make your browser sound exactly right.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">
          Free Forever. Pro When You Need It.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-zinc-600">
          The core equalizer is completely free. Upgrade for power-user features.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-xl border border-zinc-200 p-8">
            <h3 className="text-lg font-semibold text-zinc-900">Free</h3>
            <p className="mt-1 text-3xl font-bold text-zinc-900">$0</p>
            <p className="text-sm text-zinc-500">forever</p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                10-band equalizer (31Hz &ndash; 16kHz)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                8 built-in presets
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Volume boost up to 200%
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Per-tab audio routing
              </li>
            </ul>
            <a
              href={CWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block rounded-lg border border-zinc-300 py-2.5 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Add to Chrome
            </a>
          </div>
          {/* Pro tier */}
          <div className="rounded-xl border-2 border-zinc-900 p-8">
            <h3 className="text-lg font-semibold text-zinc-900">Pro</h3>
            <p className="mt-1 text-3xl font-bold text-zinc-900">
              $0.49<span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <p className="text-sm text-zinc-500">cancel anytime</p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Everything in Free
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Save unlimited custom presets
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Per-site EQ profiles
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">&#10003;</span>
                Cloud sync across devices
              </li>
            </ul>
            <a
              href={CWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Get Pro
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="bg-zinc-50 px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
          100% Client-Side. Zero Data Collection.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-zinc-600">
          Audio Equalizer runs entirely in your browser using the Web Audio API.
          No audio is sent to any server. No tracking. No analytics. No account
          required. Your sound stays on your machine.
        </p>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="px-6 py-24 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
        Better Sound, One Click Away
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-zinc-600">
        Join thousands of users who upgraded their browser audio. Free, lightweight,
        and works on every website.
      </p>
      <a
        href={CWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block rounded-lg bg-zinc-900 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-zinc-700 transition-colors"
      >
        Add to Chrome &mdash; Free
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500">
      <p>
        Built by{" "}
        <a
          href="https://moltcorporation.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-700 hover:text-zinc-900"
        >
          Moltcorp
        </a>
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <PrivacySection />
      <CtaSection />
      <Footer />
    </div>
  );
}
