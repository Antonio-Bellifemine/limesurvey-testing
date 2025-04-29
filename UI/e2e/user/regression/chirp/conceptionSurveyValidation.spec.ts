import { test, expect, Page } from '../../../../base';
import { checkVisibility, validateElementsAreNotVisible, checkIfElementIsEnabled, checkIfElementIsDisabled } from '../../../../utils/helpers';

const surveyName = "QA-AUTO-Conception, Prenatal, Birth & Neonatal - Part 1"
const trimester = ["first trimester", "second trimester", "third trimester",];


const sharedHealthConditions = [
    'cancer',
    'diabetes',
    'heart disease',
    'obesity',
    'mental health conditions',
    'autoimmune conditions',
    'arthritis',
    'ADHD/ADD',
    'asthma',
    'eczema or other skin condition',
]


test.beforeEach(async ({ page, Pom }) => {
    await page.goto(process.env.BASE_URL);
    await Pom.activeSurvey.openActiveSurvey(surveyName);
    await Pom.activeSurvey.startSurvey();
});


test.describe('Survey conditional Logic Page 1', () => {

    test('validate user can not go to next page without required answers', async ({ page, Pom }) => {
        await page.getByLabel('Mother\'s Pregnancy History Please provide information about the BIRTH MOTHER\'s').selectOption('AO03');
        await page.getByLabel('Number of pregnancies AFTER').selectOption('AO04');
        await page.getByLabel('Number of miscarriages PRIOR').selectOption('AO13');
        await page.getByLabel('Number of miscarriages AFTER').selectOption('AO01');
        await page.getByRole('textbox', { name: 'Please indicate if there was' }).click();
        await page.getByRole('textbox', { name: 'Please indicate if there was' }).fill('testing');
        await page.getByLabel('Total number of live births:').selectOption('AO03');
        await page.getByLabel('Total number of still births:').selectOption('AO01');
        await page.getByLabel('Total number of abortions:').selectOption('AO13');
        await page.getByRole('textbox', { name: 'Please provide any additional' }).fill('QA-Auto Testing');
        await page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('Yes').check();
        await page.getByRole('button', { name: 'Next' }).click();
        await expect(page.getByText('One or more required questions have not been answered. You cannot proceed until these have been completed.')).toBeVisible();
        await page.locator('#bootstrap-alert-box-modal button').click();
    });

    test('validate 1st conditional question (Number of miscarriages Prior the birth of this child)', async ({ page, Pom }) => {

        await page.getByLabel('Number of miscarriages PRIOR').selectOption('AO03');
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[0], 1);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[1], 1);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[2], 1);
    });

    test('validate 2nd conditional question (Number of miscarriages AFTER the birth of this child)', async ({ page, Pom }) => {

        await page.getByLabel('Number of miscarriages AFTER').selectOption('AO06');
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[0], 1);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[0], 2);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[0], 3);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[0], 4);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[0], 5);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[2], 1);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[2], 2);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[2], 3);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[2], 4);
        await Pom.cmsConditionalSurvey.checkTrimester(trimester[2], 5);
    });

    test('validate 3rd conditional question (Egg Donor Health History Note)', async ({ page, Pom }) => {
        const healthConditions = [
            ...sharedHealthConditions,
            'don\'t know egg donor\'s'
        ];
        const locators = await Pom.cmsConditionalSurvey.getHealthConditionLocators("egg", healthConditions);
        const conditionElements = [
            page.getByText('Please indicate which of the following apply to the egg donor. Please select'),
            page.getByText('egg donor was a blood relative'),
            page.getByText('egg donor\'s health history is'),
        ];

        await page.getByRole('radiogroup', { name: 'Egg Donor Health History Note' }).getByLabel('yes').check();
        await checkVisibility(conditionElements);
        await Pom.cmsConditionalSurvey.checkConditionVisibility(locators);
        await page.getByRole('radiogroup', { name: 'Egg Donor Health History Note' }).getByLabel('no', { exact: true }).check();
        await validateElementsAreNotVisible(conditionElements);
        await page.getByRole('radiogroup', { name: 'Egg Donor Health History Note' }).getByLabel('don\'t know').check();
        await validateElementsAreNotVisible(conditionElements);

    });

    test('validate 4th conditional question (Sperm Donor Health History Note)', async ({ page, Pom }) => {


        const healthConditions = [
            ...sharedHealthConditions,
            'other health condition'
        ];
        const locators = await Pom.cmsConditionalSurvey.getHealthConditionLocators("sperm", healthConditions);

        const conditionElements = [
            page.getByText('Please indicate which of the following apply to the sperm donor:'),
            page.getByText('sperm donor was a blood'),
            page.getByText('sperm donor\'s health history is unknown'),
            page.getByText('If the sperm donor\'s health history is known, please answer the following questions.'),
            page.getByText('Did the sperm donor have a history of any of the following?'),
        ];

        await page.getByRole('radiogroup', { name: 'Sperm Donor Health History' }).getByLabel('yes').check();
        await checkVisibility(conditionElements);
        await Pom.cmsConditionalSurvey.checkConditionVisibility(locators);

        await page.getByLabel('If the sperm donor\'s health').getByText(healthConditions[10]).click();

        const spermDonorOtherHealthElements = [
            page.getByText('Sperm donor\'s other health'),
            page.getByRole('textbox', { name: 'Sperm donor\'s other health' })
        ]

        await checkVisibility(spermDonorOtherHealthElements)
        await page.getByLabel('If the sperm donor\'s health').getByText(healthConditions[10]).click();
        await page.getByLabel('If the sperm donor\'s health').getByText(healthConditions[1]).click();
        await validateElementsAreNotVisible(spermDonorOtherHealthElements);

    });

    test('validate 5th conditional question (conception)', async ({ page, Pom }) => {
        async function conceptionPlannedQuestion(text: string) {
            const conceptionQuestion = page.getByLabel('Conception Was the conception of this child planned?');
            await conceptionQuestion.scrollIntoViewIfNeeded();
            await conceptionQuestion.getByText(text, { exact: true }).click();
        }

        const conditionElements = [
            page.getByRole('heading', { name: 'Conception' }),
            page.getByText('Which of the following, if any, describe the reaction(s) of the BIRTH MOTHER'),
            page.getByText('If hormone therapy/fertility'),
            page.getByText('Is there anything you believe'),
            page.getByRole('group', { name: 'Which of the following, if any, were used to assist in the conception of this' }),
            page.getByRole('group', { name: 'If hormone therapy/fertility' })
        ];
        await page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('No').check();
        await validateElementsAreNotVisible(conditionElements);
        await page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('Yes').check();
        await checkVisibility(conditionElements);

        // validate an option can be selected
        await conceptionPlannedQuestion('yes');
        // this option is only available when yes is checked for conception being planned
        await page.getByLabel('How long did it take the').selectOption('AO04');
        await conceptionPlannedQuestion('no');
        await expect(page.getByLabel('How long did it take the')).toBeHidden();
        await conceptionPlannedQuestion('don\'t know');
        await expect(page.getByLabel('How long did it take the')).toBeHidden();


        // Emotion Checkboxes
        const emotions = [
            { name: 'joy', label: 'mother' },
            { name: 'joy', label: 'father/other parent' },
            { name: 'fear', label: 'mother' },
            { name: 'fear', label: 'father/other parent' },
            { name: 'overwhelm', label: 'mother' },
            { name: 'overwhelm', label: 'father/other parent' },
            { name: 'relief', label: 'mother' },
            { name: 'relief', label: 'father/other parent' },
            { name: 'concern about timing', label: 'mother' },
            { name: 'concern about timing', label: 'father/other parent' },
            { name: 'concern about finances', label: 'mother' },
            { name: 'concern about finances', label: 'father/other parent' },
            { name: 'concern about impact on', label: 'mother' },
            { name: 'concern about impact on', label: 'father/other parent' },
            { name: 'generally negative reaction', label: 'mother' },
            { name: 'generally negative reaction', label: 'father/other parent' },
            { name: 'generally positive reaction', label: 'mother' },
            { name: 'generally positive reaction', label: 'father/other parent' },
            { name: 'ambivalence or confusion', label: 'mother' },
            { name: 'ambivalence or confusion', label: 'father/other parent' },
            { name: 'stress', label: 'mother' },
            { name: 'stress', label: 'father/other parent' },
            { name: 'hopeful', label: 'mother' },
            { name: 'hopeful', label: 'father/other parent' },
        ];
        await Pom.cmsConditionalSurvey.checkEmotionsTableIsVisible(emotions);
        await page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('No').check();
        await validateElementsAreNotVisible(conditionElements);
        await page.getByRole('radiogroup', { name: 'Is the conception history of' }).getByLabel('Yes').check();


        const conceptionOptions = [
            page.getByText('acupuncture'),
            page.getByText('alcohol'),
            page.getByText('assisted hatching (AH)'),
            page.getByText('astrology'),
            page.getByText('chiropractic care'),
            page.getByText('consultation with a dietician'),
            page.getByText('consultation with a health'),
            page.getByText('dietary changes'),
            page.getByText('egg donation'),
            page.getByText('energy medicine'),
            page.getByText('exercise routine'),
            page.getByText('fertility awareness (such as'),
            page.getByText('frozen embryo transfer'),
            page.getByText('hormone therapy', { exact: true }),
            page.getByText('in vitro fertilization (IVF)'),
            page.getByText('intracytoplasmic sperm'),
            page.getByText('intrauterine insemination -'),
            page.getByText('meditation'),
            page.getByText('prayer'),
            page.getByText('prolactin', { exact: true }),
            page.getByText('sperm donor', { exact: true }),
            page.getByText('stress reduction'),
            page.getByText('surgical sperm removal'),
            page.getByText('surrogacy'),
            page.getByText('vitamins or nutritional'),
            page.getByText('weight gain (on purpose)'),
            page.getByText('weight loss (on purpose)'),
        ];


        await checkIfElementIsEnabled(conceptionOptions);
        await page.getByLabel('Which of the following, if any, were used to assist in the conception of this').getByText('other', { exact: true }).click()
        await expect(page.getByRole('textbox', { name: 'Other conception assistance' })).toBeVisible();
        await page.getByLabel('Which of the following, if any, were used to assist in the conception of this').getByText('none of the above').click();
        await expect(page.getByRole('textbox', { name: 'Other conception assistance' })).toBeHidden();
        await checkIfElementIsDisabled(conceptionOptions);

        await expect(page.getByRole('textbox', { name: 'Other hormone therapy' })).toBeHidden();
        await page.getByLabel('If hormone therapy/fertility').getByText('other').click();
        await expect(page.getByRole('textbox', { name: 'Other hormone therapy' })).toBeVisible();

    });

});


test.describe('Survey conditional Logic Page 2', () => {

    test.beforeEach(async ({ page, Pom }) => {
        await Pom.cmsConditionalSurvey.fillPageOneOfCmsConditionalSurvey();
        await Pom.activeSurvey.submitCurrentSurveyPage();
    });

    test('1st conditional (Was this pregnancy considered high risk for any reason?)', async ({ page, Pom }) => {
        const pregnencyConsideredConditional = page.getByRole('textbox', { name: 'Please state the reasons this' });
        await expect(pregnencyConsideredConditional).toBeHidden();
        await page.getByRole('radiogroup', { name: 'Was this pregnancy considered' }).getByLabel('Yes').check();
        await expect(pregnencyConsideredConditional).toBeVisible();
        await page.getByLabel('Was this pregnancy considered').getByText('no', { exact: true }).click();
        await expect(pregnencyConsideredConditional).toBeHidden();
        // the question is hidden when user selects don't know
        await page.getByLabel('Was this pregnancy considered').getByText('don\'t know').click();
        await expect(pregnencyConsideredConditional).toBeHidden();
    });

    test('2nd conditional (Which of the following types of exercise did the BIRTH MOTHER do)', async ({ page, Pom }) => {


        // const pregnancyExerciseConditional = async (name: string) => {
        //     return page.getByLabel(name).getByText('Trimester 1 Please Choose...');
        // };

        const names = [
            "engage in any exercise routine",
            "engage in endurance athletics",
            'engage in "extreme" exercise',
            "running",
            "yoga",
            "walking",
            "swimming",
            "stretching",
            "weight training",
            "practice Qi Gong, Tai Chi",
            "other form of exercise",
        ];
        // "engage in any exercise routine"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[0]));
        // "engage in endurance athletics"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[1]));
        // 'engage in "extreme" exercise'
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[2]));
        // "running"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[3]));
        // "yoga"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[4]));
        // "walking"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[5]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[5]));
        // "swimming"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[6], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[6]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[6], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[6]));
        // "stretching
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[7], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[7]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[7], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[7]));
        // weight Training
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[8], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[8]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[8], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[8]));
        // "practice Qi Gong, Tai Chi"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[9], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[9]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[9], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[9]));
        // "other form of exercise",
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[10], 'Yes');
        await checkVisibility(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[10]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[10], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.pregnancyExerciseConditional(names[10]));

    });

    test('3rd conditional (What type of childbirth education, if any, did the MOTHER receive)', async ({ page, Pom }) => {
        await page.getByLabel('What type of childbirth').getByText('other').click();
        await expect(page.getByRole('textbox', { name: 'Other childbirth education:' })).toBeVisible();
    });

    test('4th conditional (BIRTH MOTHER used antibiotics during the prenatal period) Table', async ({ page, Pom }) => {

        const names = [
            "injectable antibiotics (one",
            "injectable antibiotics (multiple injections)",
            "oral antibiotics — one course",
            "oral antibiotics — multiple",
            "oral antibiotics — daily",
            "IV antibiotics (including",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[5]));


        // validate the table selections are not visible when "No" is checked
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[5]));
    });


    test('5th conditional (name or brand(s) of antibiotic taken, if known.) Table', async ({ page, Pom }) => {

        const names = [
            "Flagyl",
            "Z-Pak (azithromycin)",
            "Augmentin",
            "Cipro, Doxycycline",
            "Levaquin, Avelox, or other",
            "amoxicillin",
            "penicillin",
            "ampicillin",
            "other antibiotic"
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.tableConditionals(names[5]));


        // validate the table selections are not visible when "No" is checked
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.tableConditionals(names[5]));
    });


    test('6th conditional (BIRTH MOTHER took any of the following medications at any time during the prenatal period, during birth, or while breastfeeding)', async ({ page, Pom }) => {



        const names = [
            "amphetamines",
            "anesthesia",
            "anti-depression or anxiety",
            "anti-emesis (nausea medication such as Zofran, Remeron, etc.)",
            "anti-fungal medication (such as Nystatin, Nizoral or Diflucan)",
            "anti-histamines/allergy medication (such as Benadryl, Claritin, Zyrtec, etc.)",
            "anti-viral medications (such as Valtrex, Famvir, etc)",
            "asthma maintenance drugs (such as Advair, Flovent, Xopenex, Pulmacort, etc.)",
            "asthma rescue medications — inhalers (such as Albuterol, Terbutaline, etc)",
            "benzodiazepines for anxiety (such as Valium, Xanax, Ativan, etc.)",
            "birth control pills",
            "blood pressure medication",
            "blood thinner (such as heparin, coumadin or warfarin)",
            "chemotherapeutic medication",
            "constipation medications (such as Miralax, etc)",
            "diabetes medication",
            "IBS, Crohn's or other inflammatory bowel medication (such as Lotronex, Asacol, etc.)",
            "Immune suppressive medications (such as Humira, Remicaid, Orencia, Enbrel, etc)",
            "insulin",
            "lice medication (such as Ovide or Lindane)",
            "magnesium sulfate",
            "malaria medication",
            "Metformin",
            "nitrous oxide",
            "over-the-counter pain medications (such as ibuprofen, Advil or Motrin)",
            "prescription pain medications (such as Vicodin, Oxycontin, etc)",
            "prescription sleep medication (such as Ambien, Lunesta)",
            "reflux or heartburn medications (such as Tagamet, Zantac, Prilosec, Pepcid)",
            "seizure medications (such as Depakote, Lamictol, Keppra, etc)",
            "steroidal medications (such as oral Prednisone or injectable steroids)",
            "stimulant/ADHD medications",
            "Terbutaline (Brethine, Bricanyl, Brethaire, or Terbulin)",
            "thyroid medication (such as Synthroid, Levoxyl, etc.)",
            "Tylenol or Paracetamol (acetaminophen)",
        ];



        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[5]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[6]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[7], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[7]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[8], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[8]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[9], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[9]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[10], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[10]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[11], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[11]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[12], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[12]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[13], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[13]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[14], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[14]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[15], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[15]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[16], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[16]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[17], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[17]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[18], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[18]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[19], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[19]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[20], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[20]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[21], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[21]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[22], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[22]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[23], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[23]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[24], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[24]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[25], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[25]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[26], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[26]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[27], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[27]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[28], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[28]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[29], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[29]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[30], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[30]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[31], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[31]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[32], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[32]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[33], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[33]));

        // validate random options are not visible on "No" selection
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[5], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[5]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[6], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[6]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[7], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[7]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[8], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[8]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[24], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[24]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[25], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[25]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[26], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[26]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[27], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[27]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[28], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[28]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[29], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[29]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[30], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[30]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[31], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[31]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[32], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[32]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[33], "No");
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.medicationTableConditionals(names[33]));

    });




    test('7th conditional (Please indicate if the birth mother took any of the following vaccines at any time during the prenatal period, during birth, or while breastfeeding.)', async ({ page, Pom }) => {

        const names = [
            "a COVID-19 vaccine",
            "Tdap/DTaP vaccine",
            "flu vaccine",
            "tetanus shot",
            "any vaccine",
        ];
        // "covid"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], 'Yes');

        // "Tdap/DTaP"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], 'Yes');

        // 'flu'
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], 'Yes');

        // "tetanus"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], 'Yes');

        // "any"
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], 'Yes');


        await checkVisibility(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[0]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[0], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[0]));

        await checkVisibility(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[1]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[1], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[1]));

        await checkVisibility(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[2]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[2], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[2]));

        await checkVisibility(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[3]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[3], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[3]));

        await checkVisibility(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[4]));
        await Pom.cmsConditionalSurvey.tableRadioButtons(names[4], 'No');
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.vaccineTableConditionals(names[4]));
    });

    test('8th conditional (Which injectable medications, if any, did the BIRTH MOTHER receive while pregnant?)', async ({ page, Pom }) => {
        await page.getByText('other injectable medication', { exact: true }).click();
        await expect(page.getByRole('textbox', { name: 'Other injectable medications' })).toBeVisible();
        await page.getByText('other injectable medication', { exact: true }).click();
        await expect(page.getByRole('textbox', { name: 'Other injectable medications' })).toBeHidden();
    });

    test('9th conditional (Which of the following vitamins or nutritional supplements did the BIRTH MOTHER take during pregnancy and how frequently? )', async ({ page, Pom }) => {
        const names = [
            "take any vitamins",
            "prenatal vitamin",
            "prenatal vitamin with iron",
            'vitamin with "active folate"',
            "vitamin D",
            "omega-3 oil (fish oil)",
            "omega-3 oil (vegetarian)",
            "omega-3 oil (vegetarian)",
            "vitamin B12",
            "probiotic",
            "Magnesium",
            "vitamin C",
            "protein powder or supplement",
            "other nutritional supplement",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[5]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[6]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[7], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[7]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[8], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[8]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[9], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[9]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[10], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[10]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[11], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[11]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[12], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[12]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[13], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[13]));
    });


    test('10th conditional (Dental/Oral symptoms', async ({ page, Pom }) => {
        const names = [
            "dental decay (more than two cavities)",
            "gum disease or periodontal disease",
            "teeth grinding",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
    });

    test('11th conditional (Vision symptoms)', async ({ page, Pom }) => {
        const names = [
            "blurred vision",
            "double vision",
            "light sensitivity",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
    });

    test('12th conditional (Breathing symptoms)', async ({ page, Pom }) => {
        const names = [
            "snoring or obstructed breathing",
            "shortness of breath",
            "chronic cough",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
    });

    test('13th conditional (Skin, nails and hair symptoms)', async ({ page, Pom }) => {
        const names = [
            "eczema",
            "rectal itching",
            "itchy skin",
            "rosacea",
            "flushing (easily blushing)",
            "psoriasis",
            "acne",
            "rectal itching",
            "dandruff/seborrheic dermatitis",
            "significant hair loss",
            "ridges or lines on nails",
            "excessive facial hair",
            "patches of baldness",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[5]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[6]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[7], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[7]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[8], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[8]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[9], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[9]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[10], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[10]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[11], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[11]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[12], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[12]));
    });

    test('14th conditional (Urogenital symptoms)', async ({ page, Pom }) => {
        const names = [
            "incomplete voiding (difficulty emptying bladder)",
            "pain with urination",
            "urinary leaks or incontinence",
            "urinary urgency",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
    });


    test('15th conditional (Mood/behavior symptoms)', async ({ page, Pom }) => {
        const names = [
            "anxiety",
            "panic attacks",
            "depression",
            "apathy",
            "lack of compassion for others",
            "feelings of hopelessness",
            "hysteria",
            "mania",
            "obsessive-compulsive behaviors/feelings",
            "rage",
            "anger",
            "self-injurious behaviors",
            "weepiness",
            "rigidity",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[5]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[6]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[7], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[7]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[8], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[8]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[9], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[9]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[10], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[10]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[11], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[11]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[12], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[12]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[13], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[13]));
    });


    test('16th conditional (Brain / nervous system symptoms)', async ({ page, Pom }) => {
        const names = [
            "headaches",
            "migraines",
            "seizures",
            "neuropathy (numbness in extremities)",
            "concussion",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
    });

    test('17th conditional (Head/neck/ENT symptoms)', async ({ page, Pom }) => {
        const names = [
            "nose bleeds",
            "swollen lymph nodes",
            "stuffy nose or post-nasal drip",
            "tinnitis (ringing in the ears)",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
    });

    test('18th conditional (Metabolism/energy symptoms)', async ({ page, Pom }) => {
        const names = [
            "extreme fatigue",
            "feels sluggish or groggy after sleeping",
            "always hot",
            "always cold",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
    });

    test('18th conditional (Gastrointestinal / stooling / digestive symptoms)', async ({ page, Pom }) => {
        const names = [
            "nausea",
            "abdominal pain",
            "acid reflux or heartburn",
            "food poisoning",
            "ulcers",
            "irritable bowel syndrome (IBS)",
            "mucus and/or foam in stool",
            "blood in stool",
            "diarrhea",
            "loose stools",
            "urgent or frequent stooling (more than 4 times a day)",
            "constipation (stooling less than once a day)",
            "undigested food in stool",
            "pain with stooling",
            "gas, bloating, or abdominal pain",
            "hemorrhoids",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[5]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[6]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[7], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[7]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[8], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[8]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[9], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[9]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[10], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[10]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[11], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[11]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[12], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[12]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[13], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[13]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[14], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[14]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[15], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[15]));
    });

    test('19th conditional (Heart/cardiovascular symptoms)', async ({ page, Pom }) => {
        const names = [
            "heart murmur",
            "rapid heart beat",
            "tachycardia",
            "chest pains",
            "fainting",
            "POTS (postural orthostatic tachycardia syndrome)",
            "other heart cardiac symptoms",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[5]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[6]));
    });

    test('20th conditional (Muscles/bones/connective tissue symptoms)', async ({ page, Pom }) => {
        const names = [
            "restless legs",
            "joint pain",
            "muscle pain",
            "muscle cramps",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
    });

    test('21st conditional (Asthma and allergies)', async ({ page, Pom }) => {
        const names = [
            "allergies (food)",
            "allergies (environmental)",
            "asthma",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
    });

    test('22nd conditional (Infections while pregnant)', async ({ page, Pom }) => {
        const names = [
            "ear infections",
            "sinus or throat infections",
            "urinary tract infections",
            "vaginal yeast infections",
            "oral thrush infections",
            "fevers",
            "viral infections (e.g., influenza, COVID-19, Epstein-Barr)",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[3], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[3]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[4], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[4]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[5], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[5]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[6], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[6]));
    });

    test('23rd conditional (Infections while pregnant)', async ({ page, Pom }) => {
        const names = [
            "influenza",
            "COVID-19",
            "Epstein-Barr",
            "Zika",
            "Ebola",
            "other viral infection",
            "none of the above",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[0]);
        await checkVisibility(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[0]));
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[1]);
        await checkVisibility(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[1]));
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[2]);
        await checkVisibility(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[2]));
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[3]);
        await checkVisibility(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[3]));
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[4]);
        await checkVisibility(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[4]));
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[5]);
        await checkVisibility(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[5]));
        await Pom.cmsConditionalSurvey.clickViralInfectionOptions(names[6]);
        // when "none of the above is selected, all the other options should disappear"
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[0]));
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[1]));
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[2]));
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[3]));
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[4]));
        await validateElementsAreNotVisible(await Pom.cmsConditionalSurvey.viralInfectionSeverityTable(names[5]));
    });

    test('24th conditional (Sleep symptoms)', async ({ page, Pom }) => {
        const names = [
            "insomnia",
            "trouble falling asleep",
            "trouble staying asleep	",
        ];

        // validate the table selections are visible when "Yes" is checked
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[0], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[0]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[1], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[1]));
        await Pom.cmsConditionalSurvey.prenatalRadioButtons(names[2], "Yes");
        await checkVisibility(await Pom.cmsConditionalSurvey.prenatalConditionalsTable(names[2]));
    });

});