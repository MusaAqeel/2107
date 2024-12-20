import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { forgotPasswordAction } from "@/app/actions";
import '@testing-library/jest-dom';
import ForgotPassword from './page';
import React from 'react';

let email: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;

// Mock forgotPasswordAction to watch calls to it
jest.mock("../../actions", () => ({
    forgotPasswordAction: jest.fn(),
}));

// Mock useFormStatus to pass the checks without needing actual connection
jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn().mockReturnValue({ pending: true }),
}));

// Mock submit-button to allow us to handle and watch calls to the onClick action in tests
jest.mock("../../../components/submit-button", () => ({
    SubmitButton: ({ formAction, ...props}: {formAction: any}) => (
        <button {...props} onClick={formAction}></button>
    )
}));

describe('forgot password flow', () => {
    beforeEach( async () => {
        render( await ForgotPassword({ searchParams: Promise.resolve({ success: "Test success" }) }));
        email = screen.getByTestId('emailInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders title (TC-037)', () => {
        const title = screen.getByTestId('title');
        expect(title).toBeTruthy();
    });

    it('renders email input (TC-038)', () => {
        expect(email).toBeTruthy();
    });

    it('renders submit button (TC-039)', () => {
        expect(button).toBeTruthy();
    });

    it('renders all links (TC-040)', () => {
        expect(link).toBeTruthy();
    });

    it('submits request to change password (TC-041)', () => {
        fireEvent.change(email, { target: {value: 'testSuccess@test.com'}});
        fireEvent.click(button);
        expect(forgotPasswordAction).toBeCalled();
    });

});

// Errors tested seperatley to test the error being passed in searchParams
describe('forgot password error', () => {
    beforeEach(async () => {
        render( await ForgotPassword({ searchParams: Promise.resolve({ error: "Password update failed" }) }))
    });

    it('displays error if incorrect user email (TC-042)', () => {
        const error = screen.findByText('Password update failed');
        expect(error).toBeTruthy;
    });
});    



