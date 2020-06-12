// generator func is like a super function, in that it can generate multiple values
// return only 1 time thing, yield as many times as u like :)
import request from "request-promise-native";

async function getCurrentPageBooks({ query, startIndex, maxResults }: any) {
  const response = await request({
    method: "GET",
    url: "https://www.googleapis.com/books/v1/volumes",
    json: true,
    qs: {
      q: query,
      startIndex: startIndex,
      maxResults: maxResults,
    },
  });

  const mapEssentialInfo = ({ volumeInfo }: any) => ({
    title: volumeInfo.title,
  });
  return response.items.map(mapEssentialInfo);
}

async function* getBooksPaged({ query }: { query: string }) {
  const pageSize = 3;
  const lastPage = 5;
  let currentPage = 0;
  console.log("outside while loop");

  while (currentPage <= lastPage) {
    const pageResults = await getCurrentPageBooks({
      query: query,
      startIndex: currentPage,
      maxResults: pageSize,
    });

    yield pageResults;

    currentPage++;
  }
}

async function searchAndPrintBooks() {
  const pages = getBooksPaged({ query: "bitcoin" });

  console.log("Searching books about bitcoin...");
  for await (const page of pages) {
    console.log("Page Results : ");
    console.log(page); // e.g. [ { title: 'Bitcoin: Introducción simple' }, { title: 'Bitcoin' }, { title: 'Bitcoins' } ]
  }
}

searchAndPrintBooks();
