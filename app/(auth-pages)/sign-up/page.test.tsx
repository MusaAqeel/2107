import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from './page';
import { signUpAction } from '../../actions';

let email: HTMLInputElement;
let password: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;
let form: HTMLElement;

jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn().mockReturnValue({ pending: true }),
}));

jest.mock("../../actions", () => ({
    signUpAction: jest.fn(),
}));

jest.mock("../../../components/submit-button", () => ({
    SubmitButton: ({ formAction, ...props}: {formAction: any}) => (
        <button {...props} onClick={formAction}></button>
    )
}));

describe('login', () => {
    beforeEach(async () => {
        render( await Signup({ searchParams: Promise.resolve({ success: "Test success" }) }));
        email = screen.getByTestId('emailInput');
        password = screen.getByTestId('passwordInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
        form = screen.getByTestId('form');
    });

    it('renders title (TC-030)', async () => {
        const title = screen.getByTestId('title');
        expect(title).toBeTruthy();
    });

    it('renders email input (TC-031)', () => {
        expect(email).toBeTruthy();
    });

    it('renders password input (TC-032)', () => {
        expect(password).toBeTruthy();
    });
    
    it('renders sign up button (TC-033)', () => {
        expect(button).toBeTruthy();
    });

    it('renders all links (TC-034)', () => {
        expect(link).toBeTruthy();
    });

    it('signs up successfully (TC-036)', () => {
        fireEvent.change(email, { target: {value: 'testSuccess@test.com'}});
        fireEvent.change(password, { target: {value: 'Test12345!w'}});
        fireEvent.click(button);
        expect(button).toBeTruthy();
        expect(signUpAction).toBeCalled();
    });
});

describe('sign up error', () => {
    beforeEach(async () => {
        render( await Signup({ searchParams: Promise.resolve({ error: "Failed to Complete Sign-Up" }) }))
    });

    it('displays error if fails to create account (TC-035)', () => {
        const error = screen.findByText('Failed to Complete Sign-Up');
        expect(error).toBeTruthy;
    });
});


