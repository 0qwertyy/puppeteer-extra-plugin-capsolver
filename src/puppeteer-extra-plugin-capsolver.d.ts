import { PuppeteerExtraPlugin } from "puppeteer-extra-plugin";

export = puppeteer_extra_plugin_capsolver;

declare class puppeteer_extra_plugin_capsolver extends PuppeteerExtraPlugin {
  constructor(apiKey: string = null, verbose: number = 0);

  get name(): string;
  get defaults(): PluginOptions;

  onBrowser(browser: Puppeteer.Browser, opts: any): Promise<void>;
  onPageCreated(page: Puppeteer.Page): Promise<void>;
  onPluginRegistered(): Promise<void>;
}
