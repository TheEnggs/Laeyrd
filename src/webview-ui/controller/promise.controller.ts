class PromiseController {
  private promises: Record<string, Promise<any>> = {};
}

//  example

// const promiseController = new PromiseController();

// promiseController.add("test", new Promise((resolve) => {
//     setTimeout(() => {
//         resolve("test");
//     }, 1000);
// }));
