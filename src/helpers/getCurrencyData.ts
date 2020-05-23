import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

type CurrencyData = { name?: string; relation?: string; value?: string };

const today = new Date().toLocaleDateString("ru").replace(/\//g, "-");
const files = fs.readdirSync(path.resolve(__dirname, "../../data"));

async function getCurrencyData() {
  // check if the data is already loaded for today
  const alreadyWroteForToday = files.indexOf(today + ".json") !== -1;
  if (alreadyWroteForToday) return;

  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0,
  });
  const page = await browser.newPage();
  await page.goto("https://nationalbank.kz/?furl=cursFull&switch=rus");

  const currencyTable = await page.$(".roundborders");

  const tableData = await currencyTable?.evaluate((tableElement) => {
    const header = tableElement.querySelector("h1")?.innerText || "";
    const tableRows = tableElement.querySelectorAll("tbody tr");
    const data: CurrencyData[] = [];

    tableRows.forEach((tableRowElement, rowIndex) => {
      if (
        tableRows.length - 2 === rowIndex ||
        tableRows.length - 1 === rowIndex
      )
        return;
      const tableDataForRow = tableRowElement.querySelectorAll("td");
      const rowData: CurrencyData = {};

      tableDataForRow.forEach((td, index) => {
        const text = td.innerText;
        if (text) {
          switch (index) {
            case 1:
              rowData.name = text;
              break;
            case 2:
              rowData.relation = text;
              break;
            case 3:
              rowData.value = text;
            default:
              break;
          }
        }
      });

      data.push(rowData);
    });

    return {
      header,
      date: new Date().toISOString(),
      length: data.length,
      data,
    };
  });
  return tableData;
}

const runDataQuery = async () => {
  try {
    const data = await getCurrencyData();
    if (!data) {
      const text = `[+] Already downloaded & wrote currency data for today.\n[+] Check something like '${today}.json' inside of the 'data/' folder on your local drive or come back tomorrow`;
      console.warn(text);
      return text;
    }

    const filePath = path.resolve(__dirname, `../../data/${today}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data), {
      flag: "w",
      encoding: "utf-8",
    });
  } catch (e) {
    console.error(e);
  }
};

export { runDataQuery, today };
