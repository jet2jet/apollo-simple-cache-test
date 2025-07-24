# apollo-simple-cache-test

This repository is created for the test of [apollo-simple-cache](https://github.com/jet2jet/apollo-simple-cache) and comparing to other cache (`InMemoryCache`) and other client (urql).

## Run benchmark

After `npm install`, run:

```
npm run benchmark
```

(For dumping heap status, run `npm run benchmark:with-gc`, and during processing, execute `kill -INT <pid>` from another terminal.)

## License

[MIT License](./LICENSE)
