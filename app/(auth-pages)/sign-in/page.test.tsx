import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './page';
import { signInAction } from '@/app/actions';

let email: HTMLInputElement;
let password: HTMLInputElement;
let button: HTMLElement;
let link1: HTMLElement;
let link2: HTMLElement;

// Mock useFormStatus to pass the checks without needing actual connection
jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn().mockReturnValue({ pending: true }),
}));

// Mock signInAction to watch calls to it
jest.mock("../../actions", () => ({
    signInAction: jest.fn(),
}));

// Mock submit-button to allow us to handle and watch calls to the onClick action in tests
jest.mock("../../../components/submit-button", () => ({
    SubmitButton: ({ formAction, ...props}: {formAction: any}) => (
        <button {...props} onClick={formAction}></button>
    )
}));

describe('login', () => {
    beforeEach(async () => {
        render( await Login({ searchParams: Promise.resolve({ success: "Test success" }) }))
        email = screen.getByTestId('emailInput');
        password = screen.getByTestId('passwordInput');
        button = screen.getByTestId('submit');
        link1 = screen.getByTestId('link1');
        link2 = screen.getByTestId('link2');
    });

    it('renders title (TC-023)', () => {
        const title = screen.getByTestId('title');
        expect(title).toBeTruthy();
    });

    it('renders email input (TC-024)', () => {
        expect(email).toBeTruthy();
    });

    it('renders password input (TC-025)', () => {
        expect(password).toBeTruthy();
    });
    
    it('renders sign in button (TC-026)', () => {
        expect(button).toBeTruthy();
    });

    it('renders all links (TC-027)', () => {
        expect(link1).toBeTruthy();
        expect(link2).toBeTruthy();
    });

    it('signs in successfully (TC-029)', () => {
        fireEvent.change(email, 'testSuccess@test.com');
        fireEvent.change(password, 'test');
        fireEvent.click(button);
        expect(button).toBeTruthy();
        expect(signInAction).toHaveBeenCalled();
    });
});

// Errors tested seperatley to test the error being passed in searchParams
describe('login error', () => {
    beforeEach(async () => {
        render( await Login({ searchParams: Promise.resolve({ error: "Incorrect Login" }) }))
    });

    it('displays error if called with incorrect login (TC-028)', () => {
        const error = screen.findByText('Incorrect Login');
        expect(error).toBeTruthy;
    });
});
