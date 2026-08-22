# Privacy Policy for Just Lyrics

**Last Updated:** August 21, 2026

Thank you for using Just Lyrics! This Privacy Policy outlines how we collect, use, and protect your information when you use our browser extension. We are committed to protecting your privacy and being transparent about our data practices.

## 1. Introduction

Just Lyrics is an open-source browser extension that adds time-synced, word-by-word karaoke lyrics to YouTube Music™. It is built on top of the open-source Better Lyrics project and shares its lyrics-fetching infrastructure. Our goal is to provide this feature while collecting the minimum amount of information necessary.

## 2. Information We Collect

We collect the following types of information to provide and improve our service:

### 2.1. Information Collected Automatically

When you use Just Lyrics, the following information is processed:

* **IP Address:** Your IP address is automatically sent with every network request as part of standard internet protocol - this is necessary for our servers to send lyrics back to your browser. It is used only temporarily for security purposes (rate limiting, authentication and abuse prevention). Your IP address is *not* permanently stored and is automatically deleted from our logs after a maximum of 7 days.
* **User-Agent:** Your browser's user-agent string, which includes information about your browser type, version, and operating system. This helps debug issues and understand the user base. Your User-Agent is *not* permanently stored and is automatically deleted from our logs after a maximum of 7 days.
* **Song Metadata:** To fetch lyrics, the extension sends the song name, artist name, album name, and the YouTube™ video ID to the lyrics API at `lyrics.api.dacubeking.com`.

### 2.2. Information You Provide to Us

Just Lyrics has no user accounts and does not require you to provide any personal information.

### 2.3. Local Storage

The extension stores lyrics caches and an authentication token in your browser's local extension storage. This data never leaves your browser except as described above and can be removed at any time by uninstalling the extension or clearing its storage.

## 3. How We Use Your Information

* **To Provide and Maintain the Service:** Song metadata is used to look up matching lyrics. Your IP address is used to send the lyrics back to you.
* **For Debugging and Development:** The lyrics API logs requests for up to 7 days to monitor service health and troubleshoot issues. After 7 days, this data is deleted.
* **For Security and Abuse Prevention:** Information such as your IP address is used to protect the API from abuse and to ensure the security and stability of the service.

## 4. Information We Share

We do not sell, rent, or lease your personal information. We only share information in the following circumstances:

* **With Third-Party Service Providers:** These services have their own privacy policies, which we encourage you to review.
  * **Cloudflare:** The lyrics API runs on Cloudflare infrastructure and uses Cloudflare Turnstile to prevent abuse. You are subject to Cloudflare's Privacy Policy when these services are used.
  * **Font Providers:** Stylesheets are loaded from `api.fontshare.com` and `fonts.googleapis.com` to render lyrics typography. Standard request information (including your IP address) is visible to these providers.
* **To Fetch Lyrics:** The lyrics API may query third-party lyric sources (such as Musixmatch, LRCLib, and BiniLyrics) on its servers using the song metadata described above. No personal information beyond that metadata is forwarded.

## 5. Third-Party Services

Just Lyrics relies on the following third-party services:

* **Cloudflare:** For API hosting and security. Their privacy policy: [https://www.cloudflare.com/privacypolicy/](https://www.cloudflare.com/privacypolicy/)
* **Fontshare / Google Fonts:** For font stylesheets. Their privacy policies are available on their respective websites.
* **LRCLib and other lyric providers:** Queried server-side by the lyrics API as fallback sources for lyrics.

## 6. Data Retention

The lyrics API retains request logs, which include your IP address and other information sent with the request, for a maximum of 7 days for debugging and development purposes. After this period, this data is deleted.

## 7. Security

We take reasonable measures to protect the information we collect from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.

## 8. Your Rights

Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete the personal data held about you. As there are no user accounts and logs are kept only for a short period, the personal information held is limited. If you have any questions about your rights, please contact us.

## 9. Children's Privacy

Just Lyrics is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.

## 10. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.

## 11. Contact Us

If you have any questions about this Privacy Policy, please contact us at:

<just-lyrics@example.com>
