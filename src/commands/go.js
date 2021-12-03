const { getBranchName, checkoutPart } = require('../utils/git');
const logger = require('../utils/logger');

/**
 * @param {string} part
 * @returns {Promise<void>}
 */
async function go(part) {
	try {
		const branchName = await getBranchName();
		await checkoutPart(branchName, part);
		const partBranchName = await getBranchName();
	logger.success(`Switched to: ${logger.Highlight(partBranchName)}`);
	} catch (e) {
		if (e.message === 'NO_BRANCH') {
			if (part === 'main') {
				logger.warning(`Feature Stack does not exist`);
			} else {
				logger.warning(`Stack Item ${part} does not exist`);
			}
		} else {
			if (part === 'main') {
				logger.warning(`Failed to go to Feature Stack`);
			} else {
				logger.warning(`Failed to go to Stack Item ${part}`);
			}
		}
	}
}

module.exports = { go };
