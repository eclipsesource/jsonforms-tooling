# JSONForms Tooling Theia Plugin

The Theia plugin brings you all the functions of the tooling to your Theia editor. Within Theia you can:

* Create an example project
* Create an seed project
* Generate your basic UI Schema from your Schema

## Get Started

1. Follow [this](https://www.theia-ide.org/doc/Composing_Applications.html) instruction to install theia
2. When that is done, you first need to follow the `Get Started` instructions within the README file in the root folder. 
3. After that open the `theia-plugin` folder within Theia.
4. You you need to start the `Hosted Mode` within theia. [Here](https://www.theia-ide.org/doc/Authoring_Plugins.html#executing-the-plug-in) is a guide how to do that.
5. In the debugger window open any folder you want. 
6. Now press `ctrl+p` to open the command panel. There you can select to install the [example](https://github.com/eclipsesource/make-it-happen-react) or the [seed](https://github.com/eclipsesource/jsonforms-react-seed) project inside it. This will clone the code from the reposetories and run `npm install`
7. You can also generate an UI Schema out of any valid JSON schema file by selecting the `Generate UI Schema` command and then select the valid JSON schema file
