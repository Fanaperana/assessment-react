import { createServer } from "node:http";

createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  if (path === "/search.json") {
    response.end(
      JSON.stringify({
        docs: [
          {
            key: "/works/OL123W",
            title: "The Test Book",
            author_name: ["Example Author"],
            number_of_pages_median: 200,
          },
        ],
      }),
    );
  } else if (path === "/works/OL123W.json") {
    response.end(
      JSON.stringify({
        key: "/works/OL123W",
        title: "The Test Book",
        authors: [{ author: { key: "/authors/OL1A" } }],
        description: "A book for testing the complete reading journey.",
      }),
    );
  } else if (path === "/authors/OL1A.json") {
    response.end(JSON.stringify({ name: "Example Author" }));
  } else {
    response.statusCode = 404;
    response.end("{}");
  }
}).listen(3101, "127.0.0.1");
