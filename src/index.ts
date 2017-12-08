import * as Invented from "../../invented/" // TODO: import properly
import * as cmd from "commander"
import * as fs from "fs-extra"

const packageJSON = require("../package.json")

cmd
	.version(packageJSON.version)
	.usage("[options] <file>")
	.option("-d, --directory <path>", "Specify a directory to load Inventions from.")
	.option("-o, --outfile <path>", "Pipe the output to a file.")
	.parse(process.argv)

async function initInvented () {
	const file = cmd.args[0]

	if (!file) {
		cmd.outputHelp()
		process.exit(1)
		return
	}

	const componentDirectory = cmd.directory || (process.cwd() + "/node_modules/") // use node modules by default
	console.log("componentDirectory", componentDirectory)

	function badFileHandler (ex:string) {
		console.error(ex)
		process.exit(1)
	}

	let html:string

	try {
		html = await fs.readFile(file, "utf-8")
	} catch (ex) {
		badFileHandler(ex)

		return
	}

	if (!html) {
		badFileHandler("Empty HTML.")
	}

	new Invented.Page(
		html,
		new Invented.ComponentManifestRetrieverFS(componentDirectory),
		new Invented.ComponentManifestHandlerFS(componentDirectory),
		(page:Invented.Page) => {
			const renderedPage:string = page.render()

			// using a sync operation should be fine here
			if (cmd.outfile) {
				try {
					fs.writeFileSync(cmd.outfile, renderedPage)
				} catch (ex) {
					console.error(ex)
				}
			} else {
				// TODO: maybe more raw output?
				console.log(renderedPage)
			}
		}
	)
}

initInvented()
