let $ = (selector) => document.querySelector(selector);
let $$ = (selector) => document.querySelectorAll(selector);
let linkToTrack = "";
let wrongLinkBtn = $("button");
let sources = [
  {
    name: "Hacker News",
    link: "https://news.ycombinator.com",
    comments: [],
    more: [],
    count: 0,
  },
  {
    name: "Reddit",
    link: "https://reddit.com",
    comments: [],
    more: [],
    count: 0,
  },
  {
    name: "Lobsters",
    link: "https://lobste.rs",
    comments: [],
    more: [],
    count: 0,
  },
  {
    name: "Lemmy",
    link: "https://lemmy.ml",
    comments: [],
    more: [],
    count: 0,
  },
  {
    name: "Twitter",
    link: "https://twitter.com",
    comments: [],
    more: [],
    count: 0,
  },
];

wrongLinkBtn.addEventListener("click", () => {
  $("input").value = "";
  $("input").focus();
});

$("input").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    // linkToTrack = e.target.value;
    searchSources();
    // searchReddit(linkToTrack);
  }
  // res
});

async function searchReddit(link) {
  console.log("Searching various aggregators for comments on: " + link);
  let allRedditComments = [];
  let hitsIDs = [];
  let more = [];

  let response = await fetch(`https://old.reddit.com/search.json?q=${link}`);
  // Add the post to the data array if the post type is a link.
  if (response.url.includes("/submit.json")) {
    hitsIDs = (await response.json()).data.children
      .filter((element) => element.kind === "t3" && element.data.url === link)
      .map((element) => ({
        name: element.data.name,
        subreddit: element.data.subreddit,
      }));
  }

  async function processMatches(data) {
    const promises = data.map(async (match) => {
      //   console.log(match);
      const comment = await fetchComments(
        `https://old.reddit.com/r/${
          match.subreddit
        }/comments/${match.name.slice(3)}/.json?limit=1000`
      );
      return comment[1].data.children.length > 0
        ? comment[1].data.children
        : undefined;
    });

    const filteredResults = (await Promise.all(promises)).filter(
      (x) => x !== undefined
    );
    // console.log(filteredResults)

    for (let i = 0; i < filteredResults.length; i++) {
      // if (filteredResults)
      allRedditComments.push(...filteredResults[i]);

      more.includes(...allRedditComments.filter((x) => x.kind !== "t1")) ||
        more.push(...allRedditComments.filter((x) => x.kind !== "t1"));

      if (i === filteredResults.length - 1)
        allRedditComments = allRedditComments
          .filter(
            (x) =>
              x.kind === "t1" &&
              x.data.author !== "AutoModerator" &&
              !x.data.author.includes("bot")
          )
          .map((entry) => {
            let kind = entry?.kind;
            let author = entry?.data.author;
            let comment = entry?.data.body;
            let commentHtml = entry?.data.body_html;
            let date = entry?.data.created_utc;
            let selfID = entry?.data.name.slice(3);
            let parentID = entry?.data.parent_id.slice(3);
            let permalink = entry?.data.permalink;
            let subreddit = entry?.data.subreddit;
            let source = "Reddit";
            // Avoid bots
            return {
              kind,
              author,
              comment,
              commentHtml,
              date,
              selfID,
              parentID,
              permalink,
              subreddit,
              source,
            };
          });
      //   console.log(more);
    }

    sources[1].comments = allRedditComments;
    sources[1].count = allRedditComments.length + (more[0]?.data?.children?.length || 0);

    if (allRedditComments.length > 1) {
      console.log(sources[1].count + " comments found on Reddit!");
      allRedditComments.forEach((comment) => {
        console.log(
          `%cr/${comment.subreddit} ... u/${comment.author}`,
          "color: blue; font-weight: bold;"
        );
        console.log(`${comment.comment}`);
        // console.log(`r/${comment.subreddit} ➡ ${comment.comment}`);
      });
    } else {
      console.log("No comments found on reddit...");
    }
    // if (allRedditComments) console.log(allRedditComments);
    more.forEach((element) =>
      sources[1].more.push({
        selfID: element.data.id,
        children: element.data.children,
        count: element.data.count,
      })
    );
    // sources[1].more = allRedditComments;
    // console.log(sources);
  }

  processMatches(hitsIDs);
}

async function fetchComments(link) {
  // console.log(link);
  let response = await fetch(link);
  let result = await response.json();
  return result;
}

function formatCommentsObject() {}
async function searchHN(link) {
  let allHNComments = [];
  let response = await fetch(
    `http://hn.algolia.com/api/v1/search?query=${link}`
  );
  let data = await response.json();
  sources[0].count = data.hits.length;
  hitsIDs = data.hits.map((x) => x.objectID);
  console.log(hitsIDs);

  async function processMatches(hits) {
    const promises = hits.map(async (match) => {
      const comment = await fetchComments(
        `http://hn.algolia.com/api/v1/items/${match}`
      );
    //   console.log(comment);
      return comment;
    });
    // console.log(await Promise.all(promises));

    const filteredResults = (await Promise.all(promises))
      .filter((x) => x.url === link)
      .reduce((acc, x) => acc.concat(x.children), [])
      .map((entry) => {
        let author = entry.author;
        let comment = entry.text;
        let date = entry.created_at_i;
        let selfID = entry.id;
        let parentID = entry.parent_id;
        let permalink = `https://news.ycombinator.com/item?id=${selfID}`;
        let source = "Hacker News";
        // Avoid bots
        return {
          author,
          comment,
          date,
          selfID,
          parentID,
          permalink,
          source,
        };
      });
    for (let i = 0; i < filteredResults.length; i++) {
      allHNComments.push(filteredResults[i]);
    }

      allHNComments.forEach(comment=>{
        console.log(
            `%c${comment.source} ... ${comment.author}`,
            "color: blue; font-weight: bold;"
          );
        console.log(comment.comment);
      })
      sources[0].comments = allHNComments;
      console.log(sources);
    //   console.log(allHNComments.com)
    //   const allHNComments = await Promise.all(promises);
    //   console.log(allHNComments);
  }

  processMatches(hitsIDs);
}

function searchLemmy(link) {}

function searchTwitter(link) {}

function searchSources() {
  searchHN($("input").value);
  searchReddit($("input").value);
}

searchSources();
