export default defineContentScript({
  matches: ["https://www.fmkorea.com/*"],
  main() {
    console.log("Hello content.");
  },
});
