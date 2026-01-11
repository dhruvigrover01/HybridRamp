async function main() {
  console.log(">>> test-functions.js started");
}

main()
  .then(() => {
    console.log(">>> main finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("ERROR IN SCRIPT:", error);
    process.exit(1);
  });
