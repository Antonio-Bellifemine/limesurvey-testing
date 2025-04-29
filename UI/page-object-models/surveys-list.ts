import { time } from 'console';
import { Locator, Page, expect } from '../base';
import { clickWithRetry, getSurveyIdFromUrlParams, waitForDashboardView } from '../utils/helpers';
import path from 'path';

export class SurveysList {

  readonly page: Page;
  userAvatarSettingsButton: Locator;
  editSelectedSurveyButton: Locator;
  surveyActionBar: Locator;
  createNewSurveyButton: Locator;
  surveyTitleInput: Locator;
  createSurveyButton: Locator;
  newestSurveyCheckbox: Locator;
  editSelectedSurveysButton: Locator;
  deleteNewestSurveyButton: Locator;
  deleteSruveyModalButton: Locator;
  closeDeletedSurveyModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userAvatarSettingsButton = page.getByRole('button', { name: 'A antonio.bellifemine' });
    this.surveyActionBar = page.locator('.survey-actionbar');
    this.createNewSurveyButton = page.getByRole('link', { name: 'Create survey' });
    this.surveyTitleInput = page.getByLabel('Survey title:', { exact: true });
    this.createSurveyButton = page.getByRole('button', { name: 'Create survey' });
    this.newestSurveyCheckbox = page.locator('#sid_0');
    this.editSelectedSurveyButton = page.getByRole('button', { name: 'Edit selected surveys' });
    this.deleteNewestSurveyButton = page.getByRole('link', { name: 'Delete' });
    this.deleteSruveyModalButton = page.getByRole('button', { name: 'Delete' });
    this.closeDeletedSurveyModal = page.locator('#massive-actions-modal-survey-grid-delete-0').getByRole('button');
  };


  createSurvey = async (surveyName?: string) => {
    const name = surveyName ? surveyName : 'QA-AUTO-TEST';
    await clickWithRetry(this.page, this.createNewSurveyButton);
    await this.surveyTitleInput.fill(name);
    await clickWithRetry(this.page, this.createSurveyButton);
    await this.page.waitForURL(/surveyid=\d+/);
    return await getSurveyIdFromUrlParams(this.page.url());
  };

  importSurvey = async (fileName: string) => {
    await expect(this.createNewSurveyButton).toBeVisible({ timeout: 30000 });
    await clickWithRetry(this.page, this.createNewSurveyButton);
    await this.page.getByRole('tab', { name: 'Import' }).click();
    await this.page.getByLabel('Select survey structure file').setInputFiles(path.join(__dirname, '..', 'utils', 'survey-import-files', `${fileName}`));
    await this.page.getByRole('button', { name: 'Import survey' }).click();
    await this.page.waitForURL('**/surveyAdministration/copy');
  };

  deleteNewestSurvey = async () => {
    await waitForDashboardView(this.page);
    await this.newestSurveyCheckbox.check();
    await clickWithRetry(this.page, this.editSelectedSurveyButton);
    await this.deleteNewestSurveyButton.click();
    await this.deleteSruveyModalButton.click();
    await expect(this.page.getByRole('cell', { name: 'Deleted' })).toBeVisible();
    await this.closeDeletedSurveyModal.click();
  };

  searchForSurveyViaSurveyId = async (surveyId: string) => {
    await this.page.getByPlaceholder('Search').click();
    await this.page.getByPlaceholder('Search').fill(surveyId);
    await this.page.getByPlaceholder('Search').press('Enter');
  };

  openSurveyEditPageBySurveyId = async (surveyId?: string) => {
    const el = this.page.getByRole('cell', { name: surveyId })
    await expect(el).toBeVisible({ timeout: 10000 });
    await el.click({ delay: 750 });
  };



};
export default SurveysList;