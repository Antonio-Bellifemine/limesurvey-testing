import { expect, Locator } from '../../base'

// Define types for clarity—interfaces for assertion data
export interface DropdownAssertion {
    locator: Locator;
    expectedValue: string;
}

export interface RadioAssertion {
    locator: Locator;
    checked: boolean; // true for checked, false for not checked
}

export interface TextboxAssertion {
    locator: Locator;
    expectedValue: string;
}

// Helper functions to box up assertions—exported for use in test files
export async function assertDropdowns(dropdowns: DropdownAssertion[]): Promise<void> {
    for (const { locator, expectedValue } of dropdowns) {
        await expect(locator).toHaveValue(expectedValue);
    }
}

export async function assertRadios(radios: RadioAssertion[]): Promise<void> {
    for (const { locator, checked } of radios) {
        if (checked) {
            await expect(locator).toBeChecked();
        } else {
            await expect(locator).not.toBeChecked();
        }
    }
}

export async function assertTextboxes(textboxes: TextboxAssertion[]): Promise<void> {
    for (const { locator, expectedValue } of textboxes) {
        await expect(locator).toHaveValue(expectedValue);
    }
}

export async function assertVisibility(locators: Locator[]): Promise<void> {
    for (const locator of locators) {
        await expect(locator).toBeVisible();
    }
}