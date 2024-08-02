import { Browser, Page } from "puppeteer";

export = puppeteer_extra_plugin_capsolver;

declare class puppeteer_extra_plugin_capsolver extends PuppeteerExtraPlugin {
  constructor(apiKey: string = null, verbose: number = 0);

  onPluginRegistered(): Promise<void>;
  onBrowser(browser: Browser): Promise<void>;
  onPageCreated(page: Page): Promise<void>;
  _addSolverToPage(page: Page): void;
}
