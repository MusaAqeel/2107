import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { completeProfileAction } from "@/app/actions";
import '@testing-library/jest-dom';
import React from 'react';
import CompleteProfile from './page';

let firstNameInput: HTMLInputElement;
let lastNameInput: HTMLInputElement;
let button: HTMLElement;

jest.mock("../../actions", () => ({
    completeProfileAction: jest.fn(),
}));

jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn().mockReturnValue({ pending: true }),
}));

jest.mock("../../../components/submit-button", () => ({
    SubmitButton: ({ formAction, ...props}: {formAction: any}) => (
        <button {...props} onClick={formAction}></button>
    )
}));

jest.mock('../../../utils/supabase/server.ts', () => {
    return {
        createClient: jest.fn().mockReturnValue({
            auth: {
                getUser: jest.fn().mockReturnValue({data: { user: { name: 'test'}}})
            }
        })
    };
});

describe('forgot password flow', () => {
    beforeEach( async () => {
        render( await CompleteProfile({ searchParams: Promise.resolve({ success: "Test success" }) }));
        firstNameInput = screen.getByTestId('firstNameInput');
        lastNameInput = screen.getByTestId('lastNameInput');
        button = screen.getByTestId('submit');
    });

    it('renders title (TC-043)', () => {
        const title = screen.getByText(/Complete Profile/i);
        expect(title).toBeInTheDocument();
    });

    it('renders name inputs (TC-044)', () => {
        expect(firstNameInput).toBeTruthy();
        expect(lastNameInput).toBeTruthy();
    });

    it('renders submit button (TC-045)', () => {
        expect(button).toBeTruthy();
    });

    it('calls the completeProfileAction (TC-046)', () => {
        fireEvent.change(firstNameInput, 'first');
        fireEvent.change(lastNameInput, 'last');
        fireEvent.click(button);
        expect(completeProfileAction).toBeCalled();
    });
});


