# Dynamic QR Code Generator

![Github Action CI Unit Test](https://github.com/kenwu565657/dynamic-qr-code-generator/actions/workflows/tests.yml/badge.svg)
![Statement Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/statements.json)
![Branche Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/branches.json)
![Function Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/functions.json)
![Line Coverage](https://img.shields.io/endpoint?url=https://kenwu565657.github.io/dynamic-qr-code-generator/badges/lines.json)

This app allow user to generate and store QR code by simple Javascript Function. It is built by React Native Expo.

## Generate QR Code By JavaScript And Store QR Code
<table>
	<tr>
		<td><img src="readme-screenshot/ios/generate-qr-code-by-js.png" alt="Generate QR Code By JavaScript" width="75%" /></td>
		<td><img src="readme-screenshot/android/store-qr-code.png" alt="Store QR Code" width="100%" /></td>
	</tr>
</table>

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
