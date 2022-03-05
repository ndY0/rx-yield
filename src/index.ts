async function* func1(): AsyncGenerator<any, void, any> {
  let data: any;
  while (true) {
    const next = yield data;
    console.log(next);
    if (next) data = next;
  }
}

// async function* func2() {
//   for await (const iterator of func1()) {
//     yield iterator;
//   }
// }

async function test() {
  //   for await (const iterator of func2()) {
  //     console.log(iterator);
  //   }
  const bidirect = func1();
  await bidirect.next();
  await bidirect.next(1);
  console.log(await bidirect.next());
  await bidirect.next(2);
  console.log(await bidirect.next());
}

test();
