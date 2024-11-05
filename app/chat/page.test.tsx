import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from './page';
import LLM from '../LLM/LLM';

jest.mock("../LLM/LLM");

let input: HTMLInputElement;
let button: HTMLElement;
let slider: HTMLElement;

describe('homepage', () => {
    
    beforeEach(() => {
        render(<Chat />);
        input = screen.getByTestId('textInput');
        slider = screen.getByTestId('sliderInput');
        button = screen.getByTestId('submitButton');
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    it ('renders title', () => {
        const title = screen.getByText(/Mixify/i);
        expect(title).toBeInTheDocument();
    });

    it('limits the characters in the text box (TC-001)', () => {
        const overLimitInput = "AAAAAAAAAAAAAAAAAAAAAAAAAXXX";
        const maxInput = "AAAAAAAAAAAAAAAAAAAAAAAAA";
        fireEvent.change(input, {target: {value: maxInput}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(LLM).toBeCalledWith("AAAAAAAAAAAAAAAAAAAAAAAAA", 10);
    });

    it('submit button sends request to LLM (TC-002)', () => {
        fireEvent.change(input, {target: {value: "Test"}});
        fireEvent.click(button);

        expect(LLM).toBeCalledWith("Test", 5);
    });
    
    it('button renders Generation in process text while awaiting content generation (TC-003)', () => {
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        expect(button.textContent).toBe("Generation in process");
    });
    
    it('playlist is renders original prompt and list of songs when response received from LLM (TC-004)', () => {
        const alert = screen.queryByTestId('alert');
        expect(alert).toBeNull();

        fireEvent.change(input, 'Test');
        fireEvent.click(button);
        
        setTimeout(() => {
            expect(alert).not.toBeNull();
        }, 6000);
    });

    it('link renders once received input from LLM (TC-005)', () => {
        const link = screen.queryByTestId('alert');
        expect(link).toBeNull();

        fireEvent.change(input, 'Test');
        fireEvent.click(button);
        
        setTimeout(() => {
            expect(link).not.toBeNull();
        }, 6000);
    });

    it('save button is rendered after successful generation for user to add to spotify account (TC-006)', () => {
        const saveButton = screen.queryByTestId('saveButton') as HTMLElement;
        expect(saveButton).toBeNull();
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        setTimeout(() => {
            expect(saveButton).not.toBeNull();
        }, 6000);
    });

    it('playlist created alert (TC-007)', () => {
        const alert = screen.queryByTestId('alert');
        expect(alert).toBeNull();
        fireEvent.change(input, 'Test');
        fireEvent.click(button);
        
        setTimeout(() => {
            const alert2 = screen.getByTestId('alert');
            expect(alert2).not.toBeNull();
        }, 6000);

    });
    
    it('generic error banner renders (TC-008)', () => {
        jest.mock("../LLM/LLM", () => {
            throw new Error();
        });

        const alert = screen.queryByTestId('genericErrorAlert');
        expect(alert).toBeNull();
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        setTimeout(() => {
            expect(alert).not.toBeNull();
        }, 6000);
    });
    
    it('response not received error banner renders (TC-009)', () => {
        jest.mock("../LLM/LLM", () => {
            throw new Error("500");
        });

        const alert = screen.queryByTestId('responseNotReceivedAlert');
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        setTimeout(() => {
            expect(alert).not.toBeNull();
        }, 6000);
    });

    it('adjusts to viewport (TC-010)', () => {
        window.innerHeight = 480;
        window.innerWidth = 480;
        fireEvent.resize(window);

        const form = screen.getByTestId('form');
        expect(form).toHaveStyle('height: 1000px');

        const title = screen.getByText(/Mixify/i);
        expect(title).toHaveStyle('font-size: 100px');
    });

    it('has alt text for screen readers (TC-011)', () => {
        const image = screen.getByAltText("image of some sound waves");
        expect(image).toBeInTheDocument();
    });

    it('invalid input alert renders (TC-012)', () => {
        const alert = screen.queryByTestId('invalidInputAlert');
        expect(alert).toBeNull();
        fireEvent.change(input, {target: {value: ""}});
        fireEvent.click(button);

        setTimeout(() => {
            expect(alert).not.toBeNull();
        }, 6000);
    });  

    it('adjusts length based on slider (TC-013)', () => {
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(LLM).toBeCalledWith("test", 10);    
    });
});