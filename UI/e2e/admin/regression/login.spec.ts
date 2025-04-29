import { test, expect } from '../../../base';
import { checkVisibility } from '../../../utils/helpers';




// Reset storage state for this file to avoid being authenticated by global-auth.ts
test.use({ storageState: { cookies: [], origins: [] } });
let QA_USERNAME;
({ QA_USERNAME } = process.env); // Destructuring from process.env
QA_USERNAME = QA_USERNAME || "User Not Set"; // Fallback if undefined

// Use regex to extract the first letter of QA_USERNAME
const regex = /^(.)/; // Matches the first character
const match = QA_USERNAME.match(regex); // Find the match
const dynamicLetter = match[1].toUpperCase(); // First letter, uppercase, no default

test.skip('validate a user can log in and lands on user dashboard', async ({ page, Pom }) => {
  await Pom.auth.surveyPlatformLogin();
  const userAvatarSettingsButton = page.getByRole('button', { name: `${dynamicLetter} ${QA_USERNAME}` });
  const surveyActionBar = page.locator('.survey-actionbar');
  const editSelectedSurveyButton = page.getByText('Edit selected surveys Delete')

  await checkVisibility(userAvatarSettingsButton);
  await checkVisibility(surveyActionBar);
  await checkVisibility(editSelectedSurveyButton);
});
