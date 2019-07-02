# JSONForms Tooling Yeoman Generator

This Yeoman Generator brings you all the functions of the tooling to your terminal. Within the terminal you can:

* Create a ready to go JSONForms project
* Create an example project
* Create an seed project
* Generate your basic UI Schema from your Schema

## Get Started

> *Note*: The package is currently not published to the npm store, which will make the installation a lot easier.

1. First you need to install yeoman via `npm i -g yo`
2. Next install the yeoman jsonforms generator via `npm i -g generator-jsonforms`
3. Now the generator is available for yeoman
4. To run, just type `yo jsonforms`

If you want to avoid the interface, you can use the following parameters:

### Path

Enter the path where you want to install the project. (Default: current working directory)

Command:
```shell
yo jsonforms --path "~/Documents/Project/Seed"
```

### Schema Path

Enter the path where the JSON schema is located. If not provided, a default schema will be used.

Command:
```shell
yo jsonforms --schemaPath "~/MyProject/schema.json"
```

### Name

This name will be used inside the `package.json`. (Default: `jsonforms-react-seed`)
*Note!* Only a url like schema is allowed here (e.g. no uppercase characters, no whitespaces etc.)

Command:
```shell
yo jsonforms --name "my-project"
```

### All together

If parameters are missing, yeoman will still ask you for them via the yeoman terminal gui.

Command:
```shell
yo jsonforms --path "~/Documents/Project/Seed" --schemaPath "~/MyProject/schema.json" --name "my-project"
```

