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

async function runNew() {
	const { stdout } = await runPromptWithAnswers(
		'--new',
		[runTest.ENTER, runTest.ENTER, runTest.ENTER],
		dummyProjectPath
	);
	return stdout;
}

async function runAdd() {
	const { stdout } = await runPromptWithAnswers('--add', [runTest.ENTER], dummyProjectPath);
	return stdout;
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

	describe('Bad GH', () => {
		it('gh does not exist', async () => {});

		it('gh is not authenticated', async () => {
			const baseBranch = generateRandomBranchName();
			createBranch(baseBranch, dummyProjectPath);
			const stdout = await runNew();

			const creatingRegex = new RegExp(`Creating a PR Stack for ${baseBranch}`, 'i');
			expect(stdout).toMatch(creatingRegex);
		});
	});

	describe('new', () => {
		it('Create PR Stack', async () => {
			const baseBranch = generateRandomBranchName();
			createBranch(baseBranch, dummyProjectPath);
			const stdout = await runNew();

			const creatingRegex = new RegExp(`Creating a PR Stack for ${baseBranch}`, 'i');
			expect(stdout).toMatch(creatingRegex);
			expect(stdout).toMatch(`Created PR Stack: https://github.com/stackedpr/dummyProject/pull/`);
			expect(stdout).toMatch(`Run \`stacker --add\` to create a Stack Item`);
		});

		it('Call `new` on default branch', async () => {
			const stdout = await runNew();

			expect(stdout).toMatch('You are on main. Switch to a new branch to create a new Stack.');
		});
	});

	describe('add', () => {
		it('Create Stack Item', async () => {
			const baseBranch = generateRandomBranchName();
			createBranch(baseBranch, dummyProjectPath);
			await runNew();
			const stdout = await runAdd();

			expect(stdout).toMatch(`Creating Stack Item...`);
			expect(stdout).toMatch(`Created Stack Item: https://github.com/stackedpr/dummyProject/pull/`);
		});
	});
});
