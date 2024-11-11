import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { completeProfileAction } from "@/app/actions";
import '@testing-library/jest-dom';
import React from 'react';

let firstNameInput: HTMLInputElement;
let lastNameInput: HTMLInputElement;
let button: HTMLElement;

jest.mock("../../actions"), () => ({
    completeProfileAction: jest.fn(),
});

describe('forgot password flow', () => {
    beforeEach(() => {
        firstNameInput = screen.getByTestId('emailInfirstNameInputput');
        lastNameInput = screen.getByTestId('lastNameInput');
        button = screen.getByTestId('submit');
    });

    it('renders title (TC-043)', () => {
        const title = screen.getByText(/Complete Profile/i);
        expect(title).toBeInTheDocument();
    });

    it('renders firstName input (TC-044)', () => {
        expect(firstNameInput).toBeInTheDocument();
    });

    it('renders sign in button (TC-045)', () => {
        expect(lastNameInput).toBeInTheDocument();
    });

    it('displays error if incorrect login (TC-046)', () => {
        fireEvent.change(firstNameInput, 'first');
        fireEvent.change(lastNameInput, 'last');
        fireEvent.click(button);
        expect(completeProfileAction).toHaveBeenCalledWith(firstNameInput);
        expect(completeProfileAction).toHaveBeenCalledWith(lastNameInput);
    });
});


