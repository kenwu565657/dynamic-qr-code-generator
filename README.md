# Dynamic QR Code Generator

![Github Action CI Unit Tests](https://github.com/kenwu565657/dynamic-qr-code-generator/actions/workflows/tests.yml/badge.svg)
![Statements Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/statements.json)
![Branches Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/branches.json)
![Functions Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/functions.json)
![Lines Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/lines.json)

This app allow user to generate and store QR code by simple Javascript Function. It is built by React Native Expo.

# App Screenshot
## Generate QR Code By JavaScript
![](/readme-screenshot/ios/generate-qr-code-by-js.png)

## Store QR Code
![](/readme-screenshot/android/store-qr-code.png)
# How to Start Development
```sh
npm run start
```

# How to Unit Test
```sh
npm run test
```

# How to Check Unit Test Coverage
```sh
npm run test:coverage
```

This prints the local coverage summary in the terminal and writes the report files to the `coverage/` folder.

# Build App By Expo Android
```sh
npx eas-cli build --platform android --profile production
```

# Build App By Expo IOS
```sh
npx eas-cli build --platform ios --profile production
```
