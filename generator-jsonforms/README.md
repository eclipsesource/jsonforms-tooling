# JSONForms Tooling Yeoman Generator

This Yeoman Generator brings you all the functions of the tooling to your terminal. Within the terminal you can:

* Create a ready to go JSONForms project
* Create an example project
* Create an seed project
* Generate your basic UI Schema from your Schema

## Get Started

> *Note*: The package is currently not published to the npm store, which will make the installation a lot easier.

1. First you need to install yeoman via `npm i -g yo`
2. Next you need to run `npm link` inside the main folder
3. Now the generator is available for yeoman
4. To run, just type `yo jsonforms`
5. yeoman will ask you some questions (e.g. which project, which path etc.)

If you want to avoid the interface, you can use the following parameters:

### Project

Choose the project you would like to scaffold

Current available project seeds:
- `scaffolding`
- `seed`
- `example`

Command:
```shell
yo jsonforms --project "seed"
```

### Path

Enter the path where you want to install the project

You can also use `current` if you want to use the current terminal folder

Command:
```shell
yo jsonforms --path "~\Documents\Project\Seed"
```

### Schema Path

Enter the URL where the JSON schema is located

This is important for the Scaffolding project to work.

Command:
```shell
yo jsonforms --project "Scaffolding" --schemaPath "/Users/CurrentUser/Desktop/project_files/schema_file.json"
```

### Name

This parameter is only available for the `seed` project. This name will be used inside the `package.json`.
*Note!* Only a url like schema is allowed here (e.g. no uppercase characters, no whitespaces etc.)

Command:
```shell
yo jsonforms --name "my-project"
```

### All together

If parameters are missing, yeoman will still ask you for them via the yeoman terminal gui.

Command:
```shell
yo jsonforms --project "seed" --path "~\Documents\Project\Seed" --name "my-project"
```

