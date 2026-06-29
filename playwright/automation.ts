import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { fileURLToPath } from "url";

const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

/**
 * Playwright automation script that:
 * 1. Launches Chromium
 * 2. Opens a browser
 * 3. Visits a website
 * 4. Downloads a sample PDF
 * 5. Outputs JSON result to stdout
 *
 * Run with: npx tsx playwright/automation.ts
 */

function downloadFile(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
  });
}

async function runAutomation(): Promise<void> {
  let browser = null;

  try {
    // Launch browser
    browser = await chromium.launch();
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const downloadsDir = path.join(scriptDir, "downloads");

    // Ensure downloads directory exists
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const page = await browser.newPage({
      acceptDownloads: true,
    });

    // Visit a website
    await page.goto("https://www.w3.org/WAI/WCAG21/Techniques/pdf/", {
      waitUntil: "load",
      timeout: 30000,
    });

    // Try to find and download a PDF link from the page
    let filePath: string | null = null;

    const downloadPromise = page.waitForEvent("download").catch(() => null);

    // Look for PDF links on the page
    const pdfLinks: string[] = await page.$$eval(
      'a[href$=".pdf"], a[href*=".pdf?"], a[href*="pdf"]',
      (elements: any[]) => elements.map((el: any) => el.getAttribute("href") || "").filter((href: string) => href.length > 0)
    );

    if (pdfLinks.length > 0) {
      // Click the first available PDF link
      await page.click('a[href$=".pdf"], a[href*=".pdf?"], a[href*="pdf"]');
      const download = await downloadPromise;

      if (download) {
        const filename = download.suggestedFilename();
        filePath = path.join(downloadsDir, filename);
        await download.saveAs(filePath);
      }
    }

    // If no PDF found via page links, download a known-good sample PDF directly.
    if (!filePath) {
      const filename = "sample.pdf";
      filePath = path.join(downloadsDir, filename);

      try {
        await downloadFile(SAMPLE_PDF_URL, filePath);
      } catch (error) {
        throw new Error(
          `Unable to download a valid PDF sample from ${SAMPLE_PDF_URL}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Output JSON result
    console.log(
      JSON.stringify({
        filePath,
      })
    );

    await page.close();
  } catch (error) {
    console.error("Automation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the automation
runAutomation();