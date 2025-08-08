"use client";

import { useState, useEffect } from "react";
import Head from "next/head";

// Define supported LLMs and whether they should be allowed by default.
const llmList: { name: string; defaultAllow: boolean }[] = [
  { name: "OpenAI", defaultAllow: true },
  { name: "Perplexity", defaultAllow: true },
  { name: "ClaudeBot", defaultAllow: false },
  { name: "Google-Extended", defaultAllow: false },
  { name: "CCBot", defaultAllow: false },
];

export default function Home() {
  // Store user-provided website URL
  const [siteUrl, setSiteUrl] = useState<string>("");
  // Store optional contact email
  const [contact, setContact] = useState<string>("");
  // Store allow/disallow settings for each LLM
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    return Object.fromEntries(
      llmList.map(({ name, defaultAllow }) => [name, defaultAllow])
    );
  });
  // Generated content of LLMs.txt
  const [generatedContent, setGeneratedContent] = useState<string>("");
  // State to provide feedback when the content has been copied
  const [copied, setCopied] = useState<boolean>(false);

  // When input values or settings change, regenerate the LLMs.txt content
  useEffect(() => {
    const lines: string[] = [];
    const urlDisplay = siteUrl.trim() || "your site";
    lines.push(`# LLMs.txt generated for ${urlDisplay}`);
    // Start with a default deny-all rule
    lines.push("User-Agent: *");
    lines.push("Disallow: /");
    // Specify allow/disallow for each selected LLM
    llmList.forEach(({ name }) => {
      const allow = settings[name];
      lines.push("");
      lines.push(`User-Agent: ${name}`);
      lines.push(allow ? "Allow: /" : "Disallow: /");
    });
    // Append contact info if provided
    const contactTrim = contact.trim();
    if (contactTrim) {
      lines.push("");
      lines.push(`# Contact: ${contactTrim}`);
    }
    setGeneratedContent(lines.join("\n"));
    setCopied(false);
  }, [siteUrl, contact, settings]);

  // Toggle allow/disallow for an individual LLM
  const toggleSetting = (name: string) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Copy generated content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
    } catch (err) {
      console.error(err);
      setCopied(false);
    }
  };

  // Download LLMs.txt file locally
  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "LLMs.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Current year for the footer
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Head>
        <title>LLMs.txt Generator</title>
        <meta
          name="description"
          content="Easily generate an LLMs.txt file to control which large language model crawlers may access your website."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-8 bg-white text-gray-900">
        {/* Hero section */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            LLMs.txt Generator
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Generate your own LLMs.txt file in seconds and control which AI models can use the content on your website.
          </p>
        </header>
        {/* Main form */}
        <main className="w-full max-w-3xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="site-url" className="font-medium">
              Website URL
            </label>
            <input
              id="site-url"
              type="text"
              placeholder="https://example.com"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium">Select LLM access</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {llmList.map(({ name }) => (
                <label key={name} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings[name]}
                    onChange={() => toggleSetting(name)}
                    className="accent-blue-600"
                  />
                    <span className="flex-1">
                      {name}
                      <span className="ml-2 text-xs text-gray-500">
                        ({settings[name] ? "Allow" : "Disallow"})
                      </span>
                    </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="contact" className="font-medium">
              Contact email (optional)
            </label>
            <input
              id="contact"
              type="email"
              placeholder="you@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="generated" className="font-medium">
              Generated LLMs.txt
            </label>
            <textarea
              id="generated"
              readOnly
              value={generatedContent}
              className="border border-gray-300 rounded-md p-2 w-full h-40 font-mono resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </main>
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-600">
          <p>
            © {currentYear} LLMs.txt Generator. All rights reserved.
          </p>
          <p>
            Need help? {" "}
            <a
              href={contact.trim() ? `mailto:${contact.trim()}` : "mailto:info@example.com"}
              className="underline"
            >
              Contact us
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}