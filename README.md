# fhir-validator-must-support

This project is a simple tool to validate FHIR resources against the MustSupport field defined in the FHIR specification.

Caution: This tool ONLY validates the "MustSupport" rules defined in the FHIR specification. It does NOT validate the other rules defined in the FHIR specification. Please consider using this tool to integrate with other FHIR validator to validate the FHIR resources.

給新手用的傻瓜指引請點這裡：[README_ZH_NOOB.md](README_ZH_NOOB.md)
For the guide for beginners, please click here: [README_ZH_NOOB.md](README_ZH_NOOB.md)

## Installation
To use this tool, you need to have Node.js and Yarn Package Manager installed on your machine. You can download it from the following links:
- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)

After installing Node.js, you can run the following command to install the dependencies:
```bash
$ yarn
```
## Configuration
You can configure the tool by editing the `config.json` file. The configuration file contains the following properties:
- `package`: The package name of the FHIR Implementation Guide (IG) that you want to validate.
- `version`: The version of the FHIR Implementation Guide (IG) that you want to validate.
- `cachePath`: The path to the cache directory where the FHIR IG will be downloaded and stored.

example:
```json
{
  "package": "hl7.fhir.us.core",
  "version": "3.1.0",
  "cachePath": "./ig_cache"
}
```

## Usage
```bash
$ node index.js [-f|--file] <filename> | [-e|--example] <valid|invalid>
```
### Validate a FHIR resource file
To validate a FHIR resource file, you can run the following command:
```bash
$ node index.js -f <path-to-fhir-resource-file>
```
or
```bash
$ node index.js --file <path-to-fhir-resource-file>
```

### Use example FHIR resource files
The example FHIR resource files are located in the `examples` directory. You can use the following command to validate the example FHIR resource files:
```bash
$ node index.js -e <valid|invalid>
```
or
```bash
$ node index.js --example <valid|invalid>
```

## License
This project is licensed under the "CC BY-NC-ND 3.0 Taiwan" license. For more information, please refer to the [LICENSE](LICENSE) file.

You are free to:
- Share — copy and redistribute the material in any medium or format
- The licensor cannot revoke these freedoms as long as you follow the license terms.

Under the following terms:
- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- NonCommercial — You may not use the material for commercial purposes.
- NoDerivatives — If you remix, transform, or build upon the material, you may not distribute the modified material.

### Exemptions
The following entities are exempt from the license terms:
- Medical Image Standards Association of Taiwan (MISAT)
  - The members of the MISAT are allowed to use the material for commercial purposes. But they must only use the material within the scope of non-profit activities (i.e. research, providing public service) of the MISAT.
- Medical Informatics Taiwan Connection (MI-TW Connection) Working Group
  - The members of the MI-TW Connection Working Group are allowed to use the material for commercial purposes. But they must only use the material within the scope of the MI-TW Connection Working Group activities.

For more information, please refer to the [LICENSE](LICENSE) file.