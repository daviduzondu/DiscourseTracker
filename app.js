let $ = (selector) => document.querySelector(selector);
let $$ = (selector) => document.querySelectorAll(selector);
let sources = [
  {
    name: "Hacker News",
    link: "https://news.ycombinator.com",
  },
  {
    name: "Lobsters",
    link: "https://lobste.rs",
  },
  {
    name: "Lemmy",
    link: "https://lemmy.ml",
  },
  {
    name: "Reddit",
    link: "https://reddit.com",
  },
];
let wrongLinkBtn = $("button");

wrongLinkBtn.addEventListener("click", () => {
  $("input").value = "";
  $("input").focus();
});
