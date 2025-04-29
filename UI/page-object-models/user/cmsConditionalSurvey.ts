
import { expect, Locator, Page } from '../../base';


export class CmsConditionalSurvey {

    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    };


    fillPageOneOfCmsConditionalSurvey = async () => {
        await this.page.getByLabel('Mother\'s Pregnancy History Please provide information about the BIRTH MOTHER\'s').selectOption('AO01');
        await this.page.getByLabel('Number of pregnancies AFTER').selectOption('AO02');
        await this.page.getByLabel('Number of miscarriages PRIOR').selectOption('AO02');
        await this.page.getByRole('radio', { name: 'first trimester' }).first().check();
        await this.page.getByLabel('Number of miscarriages AFTER').selectOption('AO02');
        await this.page.getByRole('radio', { name: 'first trimester' }).nth(1).check();
        await this.page.getByRole('textbox', { name: 'Please indicate if there was' }).click();
        await this.page.getByRole('textbox', { name: 'Please indicate if there was' }).fill('QA-AUTO-TESTING');
        await this.page.getByLabel('Total number of live births:').selectOption('AO01');
        await this.page.getByLabel('Total number of still births:').selectOption('AO02');
        await this.page.getByLabel('Total number of abortions:').selectOption('AO02');
        await this.page.getByRole('textbox', { name: 'Please provide any additional' }).click();
        await this.page.getByRole('textbox', { name: 'Please provide any additional' }).fill('QA-AUTO-TESTING');
        await this.page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('yes').check();
        await this.page.getByRole('radiogroup', { name: 'Egg Donor Health History Note' }).getByLabel('yes').check();
        await this.page.getByText('egg donor was a blood relative').click();
        await this.page.getByLabel('If the egg donor\'s history is').getByText('diabetes').click();
        await this.page.getByLabel('If the egg donor\'s history is').getByText('other health condition').click();
        await this.page.getByRole('textbox', { name: 'Egg donor\'s other health' }).click();
        await this.page.getByRole('textbox', { name: 'Egg donor\'s other health' }).fill('QA-AUTO-TESTING');
        await this.page.getByRole('radiogroup', { name: 'Sperm Donor Health History' }).getByLabel('yes').check();
        await this.page.getByText('sperm donor was a blood').click();
        await this.page.getByLabel('If the sperm donor\'s health').getByText('ADHD/ADD').click();
        await this.page.getByLabel('If the sperm donor\'s health').getByText('other health condition').click();
        await this.page.getByRole('textbox', { name: 'Sperm donor\'s other health' }).click();
        await this.page.getByRole('textbox', { name: 'Sperm donor\'s other health' }).fill('QA-AUTO-TESTING');
        await this.page.getByLabel('Conception Was the conception of this child planned?').getByText('yes').click();
        await this.page.getByLabel('How long did it take the').selectOption('AO01');
        await this.page.getByLabel('relief').getByText('Yes').first().click();
        await this.page.getByLabel('generally positive reaction').getByText('Yes').first().click();
        await this.page.getByLabel('generally positive reaction').getByText('Yes').nth(1).click();
        await this.page.getByLabel('hopeful').getByText('Yes').first().click();
        await this.page.getByLabel('hopeful').getByText('Yes').nth(1).click();
        await this.page.getByText('prayer').click();
        await this.page.getByLabel('Which of the following, if any, were used to assist in the conception of this').getByText('other', { exact: true }).click();
        await this.page.getByRole('textbox', { name: 'Other conception assistance' }).click();
        await this.page.getByRole('textbox', { name: 'Other conception assistance' }).fill('QA-AUTO-TESTING');
        await this.page.getByLabel('If hormone therapy/fertility').getByText('other').click();
        await this.page.getByRole('textbox', { name: 'Other hormone therapy' }).click();
        await this.page.getByRole('textbox', { name: 'Other hormone therapy' }).fill('QA-AUTO-TESTING');
        await this.page.getByRole('textbox', { name: 'Is there anything you believe' }).click();
        await this.page.getByRole('textbox', { name: 'Is there anything you believe' }).fill('QA-AUTO-TESTING');
        await this.page.getByRole('textbox', { name: 'Is there anything you believe' }).fill('QA-AUTO-TESTING');
        await this.page.getByRole('textbox', { name: 'About this Section If there' }).click();
        await this.page.getByRole('textbox', { name: 'About this Section If there' }).fill('QA-AUTO-TESTING');
    };



    checkTrimester = async (trimester: string, position: number) => {
        const locator = this.page.getByRole('radio', { name: trimester })
        if (position === 1) {
            await expect(locator.first()).toBeVisible();
        };
        if (position === 2) {
            await expect(locator.nth(1)).toBeVisible();
        };
        if (position === 3) {
            await expect(locator.nth(2)).toBeVisible();
        };
        if (position === 4) {
            await expect(locator.nth(3)).toBeVisible();
        };
        if (position === 5) {
            await expect(locator.nth(4)).toBeVisible();
        };
    };

    checkEmotionsTableIsVisible = async (emotions) => {
        for (const { name, label } of emotions) {
            let el = this.page.getByLabel(name).getByText(label);
            await expect(el).toBeVisible();
        };
    }



    getHealthConditionLocators = async (donor: string, conditions: string[]) => {
        let healthOrHistory = donor === "sperm" ? `If the ${donor} donor\'s health` : `If the ${donor} donor\'s history is`;
        const baseLocator = this.page.getByLabel(healthOrHistory);
        return conditions.map(condition => baseLocator.getByText(condition));
    };

    checkConditionVisibility = async (locator) => {
        await Promise.all(locator.map(locator => expect(locator).toBeVisible()));
    };

    tableRadioButtons = async (name, yesOrNo) => {
        return await this.page.getByRole('group', { name: name }).getByRole('radio', { name: yesOrNo, exact: true }).first().check();
    };

    tableConditionals = async (name: string) => {
        return this.page.getByLabel(name).getByText('first trimester Yes');
    };

    vaccineTableConditionals = async (name: string) => {
        return this.page.getByLabel(name).getByText('1st trimester Yes');
    };

    pregnancyExerciseConditional = async (name: string) => {
        return this.page.getByLabel(name).getByText('Trimester 1 Please Choose...');
    };

    medicationTableConditionals = async (name: string) => {
        return this.page.getByLabel(name).getByText('frequency 1st trimester Please Choose...NeverOnceRarelySometimesoftenDailyMore');
    };

    prenatalConditionalsTable = async (name: string) => {
        return this.page.getByRole('rowheader', { name: name, exact: true }).nth(1);
    };

    prenatalRadioButtons = async (name: string) => {
        await this.page.getByLabel(name, { exact: true }).getByRole('radio', { name: 'Yes' }).check();
    };

    clickViralInfectionOptions = async (infection: string) => {
        await this.page.getByLabel('Which of the following viral').getByText(infection).click();
    };

    viralInfectionSeverityTable = async (infection: string) => {
        return this.page.getByRole('rowheader', { name: infection, exact: true });
    };

}
export default CmsConditionalSurvey;