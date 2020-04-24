(async () => {
  const puppeteer = require("puppeteer");
  const interval = 1000 * 60 * 2;
  let browser, page;

  const lunchBrowser = async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=fr-FR,fr"],
    });
  };

  await lunchBrowser();
  setInterval(async () => {
    await bootstrap();
  }, interval);

  const bootstrap = async () => {
    page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto(
      "https://authc.univ-toulouse.fr/login?service=https%3A%2F%2Firis.univ-tlse2.fr%2Fmoodle-ent%2Flogin%2Findex.php",
      {
        waitUntil: "networkidle2",
      }
    );
    if ((await page.$("#username")) !== null) {
      await page.focus("#username");
      await page.keyboard.type(process.env.login);
      await page.focus("#password");
      await page.keyboard.type(process.env.password);
      const BtnConnect = await page.$("button.button");
      await BtnConnect.click();
      await page.waitForNavigation();
    }

    await Promise.all([
      page.goto(
        "https://iris.univ-tlse2.fr/moodle-ent/mod/attendance/view.php?id=423442&view=5",
        { waitUntil: "networkidle0" }
      ),
      page.waitForNavigation({ waituntil: "domcontentloaded" }),
    ]);

    if ((await page.$("td.statuscol.cell.c2.lastcol a")) !== null) {
      const handle = await page.$("td.statuscol.cell.c2.lastcol a");
      const spanText = await page.evaluate(
        (span) => span.getAttribute("href"),
        handle
      );
      await Promise.all([
        page.goto(spanText, { waitUntil: "networkidle0" }),
        page.waitForNavigation({ waituntil: "domcontentloaded" }),
      ]);
      const RP = await page.$("#id_status_301");
      await RP.click();
      const BtnSubbmit = await page.$("#id_submitbutton");
      await BtnSubbmit.click();
      await page.waitForNavigation();
      console.log(
        `${new Date().toLocaleString(undefined, { hour12: false })} -  Présent`
      );
    }

    await page.close();
  };
})();
