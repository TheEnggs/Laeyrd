const greet = (name) => {
  log(`Hello, ${name}!`);
};

for (const n of ["World", "VS Code"]) {
  greet(n);
}
