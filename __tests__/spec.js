const path = require('path');
const fs = require('fs');
const runTest = require('cli-prompts-test');
const { createBranch } = require('../src/utils/git');
const { runSync } = require('../src/utils/cmd');
const CLI_PATH = path.join(__dirname, `../bin/index.js`);

const dummyProjectPath = path.join(__dirname, 'dummyProject');
const env = { FORCE_COLOR: '0' }; // Disables chalk's colors for testing
jest.setTimeout(500000);

function runPromptWithAnswers(args, answers, testPath) {
	return runTest([CLI_PATH].concat(args), answers, {
		testPath,
		timeout: 2000,
		env,
	});
}

function generateRandomBranchName() {
	const length = 10;
	const result = [];
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
	}
	return result.join('');
}

function checkoutMain() {
	runSync('git checkout main', dummyProjectPath);
}

describe('cli', () => {
	beforeAll(() => {
		if (!fs.existsSync(dummyProjectPath)) {
			console.log('Creating dummy project');
			runSync('git clone git@github.com:stackedpr/dummyProject.git', __dirname);
		}
	});
	beforeEach(() => {
		checkoutMain();
	});
	afterAll(() => {
		checkoutMain();
	});

	it('new', async () => {
		const baseBranch = generateRandomBranchName();
		createBranch(baseBranch, dummyProjectPath);
		const { stdout } = await runPromptWithAnswers(
			'--new',
			[runTest.ENTER, runTest.ENTER],
			dummyProjectPath
		);

		const creatingRegex = new RegExp(`Creating a PR Stack for ${baseBranch}`, 'i');
		expect(stdout).toMatch(creatingRegex);
		expect(stdout).toMatch(`Created PR Stack: https://github.com/stackedpr/dummyProject/pull/`);
		expect(stdout).toMatch(`Run \`stacker --add\` to create a Stack Item`);
	});

	it('add', async () => {
		const baseBranch = generateRandomBranchName();
		createBranch(baseBranch, dummyProjectPath);
		await runPromptWithAnswers('--new', [runTest.ENTER, runTest.ENTER], dummyProjectPath);
		const { stdout } = await runPromptWithAnswers('--add', [runTest.ENTER], dummyProjectPath);

		expect(stdout).toMatch(`Creating Stack Item...`);
		expect(stdout).toMatch(`Created Stack Item: https://github.com/stackedpr/dummyProject/pull/`);
	});
});
