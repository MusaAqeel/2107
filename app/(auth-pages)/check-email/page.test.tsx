import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { forgotPasswordAction } from "@/app/actions";
import '@testing-library/jest-dom';
import React from 'react';
import { Information } from '@/components/ui/information';
import CheckEmail from './page';

let button: HTMLElement;
let link: HTMLElement;
let info: HTMLElement;

jest.mock("../../actions"), () => ({
    checkEmailAction: jest.fn(),
});


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
                getUser: jest.fn().mockReturnValue({data: { user: { name: 'test', email: 'test@test.com'}  }})
            }
        })
    };
});

describe('email confirmation page', () => {

    beforeEach( async () => {
        render( await CheckEmail({ searchParams: Promise.resolve({ success: "Test success", email: "test@test.com" }) }))
        screen.debug();
        info = screen.getByText(/We've sent you an email/);
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders information (TX-047)', () => {
        expect(info).toBeTruthy();
    });

    it('renders all links (TC-048)', () => {
        expect(link).toBeTruthy();
    });

    it('renders the submit button (TC-049)', () => {
        expect(button).toBeTruthy();
    });
});