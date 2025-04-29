import { test, expect, Page, Locator } from '../../../../base';
import { checkVisibility, getSurveyIdFromParticipantSurveyUrl } from '../../../../utils/helpers';
import { generateRandomUser, User } from '../../../../utils/interfaces/userInterface';
import {
    assertDropdowns,
    assertRadios,
    assertTextboxes,
    assertVisibility,
    DropdownAssertion,
    RadioAssertion,
    TextboxAssertion
} from '../../../../utils/interfaces/surveyInterface';

let surveyId: string;
let surveyName;

test.describe('Partial Survey Validation', () => {

    let user: User;
    surveyName = "QA-AUTO-Conception, Prenatal, Birth & Neonatal - Part 1";

    test.beforeEach(async ({ page, Pom }) => {

        // Generate a single random user to use throughout the test, ensuring consistency between save and load actions
        user = generateRandomUser();
        await page.goto(process.env.BASE_URL);
        await Pom.activeSurvey.openActiveSurvey(surveyName);
        // Begin the survey
        await Pom.activeSurvey.startSurvey();
        surveyId = await getSurveyIdFromParticipantSurveyUrl(page.url());
        await Pom.cmsConditionalSurvey.fillPageOneOfCmsConditionalSurvey();
        await Pom.activeSurvey.saveActiveSurvey(user);
        // Navigate to resume later option
        await Pom.activeSurvey.resumeLaterButton.click();
        // Attempt to load the previously saved survey with the same user
        await Pom.activeSurvey.loadUnfinishedSurvey(user, surveyId);
        // await Pom.activeSurvey.submitCurrentSurveyPage();
    });

    test('Validate page 1 contains previous responses when loaded', async ({ page }) => {
        // Define arrays of elements to assert
        const dropdowns: DropdownAssertion[] = [
            { locator: page.getByLabel('Mother\'s Pregnancy History Please provide information about the BIRTH MOTHER\'s'), expectedValue: 'AO01' },
            { locator: page.getByLabel('Number of pregnancies AFTER'), expectedValue: 'AO02' },
            { locator: page.getByLabel('Number of miscarriages PRIOR'), expectedValue: 'AO02' },
            { locator: page.getByLabel('Number of miscarriages AFTER'), expectedValue: 'AO02' },
            { locator: page.getByLabel('Total number of live births:'), expectedValue: 'AO01' },
            { locator: page.getByLabel('Total number of still births:'), expectedValue: 'AO02' },
            { locator: page.getByLabel('Total number of abortions:'), expectedValue: 'AO02' },
            { locator: page.getByLabel('How long did it take the'), expectedValue: 'AO01' },
        ];

        const radios: RadioAssertion[] = [
            { locator: page.getByRole('radio', { name: 'first trimester' }).first(), checked: true },
            { locator: page.getByRole('radio', { name: 'first trimester' }).nth(1), checked: true },
            { locator: page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('yes'), checked: true },
            { locator: page.getByRole('radiogroup', { name: 'Egg Donor Health History Note' }).getByLabel('yes'), checked: true },
            { locator: page.getByLabel('If the egg donor\'s history is').getByText('diabetes'), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('If the egg donor\'s history is').getByText('other health condition'), checked: true }, // Assuming checkbox
            { locator: page.getByRole('radiogroup', { name: 'Sperm Donor Health History' }).getByLabel('yes'), checked: true },
            { locator: page.getByLabel('If the sperm donor\'s health').getByText('ADHD/ADD'), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('If the sperm donor\'s health').getByText('other health condition'), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('relief').getByText('Yes').first(), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('generally positive reaction').getByText('Yes').first(), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('generally positive reaction').getByText('Yes').nth(1), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('hopeful').getByText('Yes').first(), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('hopeful').getByText('Yes').nth(1), checked: true }, // Assuming checkbox
            { locator: page.getByText('prayer'), checked: true }, // Assuming checkbox
            { locator: page.getByLabel('Which of the following, if any, were used to assist in the conception of this').getByText('other', { exact: true }), checked: true }, // Assuming checkbox
        ];

        const textboxes: TextboxAssertion[] = [
            { locator: page.getByRole('textbox', { name: 'Please indicate if there was' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'Please provide any additional' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'Egg donor\'s other health' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'Sperm donor\'s other health' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'Other conception assistance' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'Other hormone therapy' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'Is there anything you believe' }), expectedValue: 'QA-AUTO-TESTING' },
            { locator: page.getByRole('textbox', { name: 'About this Section If there' }), expectedValue: 'QA-AUTO-TESTING' },
        ];

        const visibleElements: Locator[] = [
            page.getByText('egg donor was a blood relative'),
            page.getByText('sperm donor was a blood'),
            page.getByLabel('Conception Was the conception of this child planned?').getByText('yes'),
            page.getByLabel('If hormone therapy/fertility').getByText('other'),
        ];

        // Execute assertions
        await assertDropdowns(dropdowns);
        await assertRadios(radios);
        await assertTextboxes(textboxes);
        await assertVisibility(visibleElements);
    });
});