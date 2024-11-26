import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from './page';
import React from 'react';

let input: HTMLInputElement;
let button: HTMLElement;
let slider: HTMLElement;

jest.mock('../../utils/supabase/client.ts', () => {
    return {
        createClient: jest.fn().mockReturnValue({
            auth: {
                getUser: jest.fn().mockReturnValue({data: { user: { name: 'test'}}})
            }
        })
    };
});


jest.mock('../hooks/connectionStatus', () => {
    return {
        SpotifyConnectionStatus: jest.fn().mockReturnValue({
            spotifyConnection: {
                access_token: 'test',
                profile_data: {
                    display_name: 'Test Name',
                    images: ['testURL']
                }
            },
            connectionError: (null)
        })
    };
});

jest.mock("next/headers", () => ({
    headers: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('TEST'),
    }),
}));

global.fetch = jest.fn().mockReturnValue({
    json: jest.fn().mockReturnValue({
        recommendations: {
            recommendations: ['Test 1', 'Test 2', 'Test 3']
        }
    })
});

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
        fireEvent.change(input, {target: {value: overLimitInput}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(fetch).toHaveBeenCalledWith("api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: maxInput,
                auth_token: 'test',
            })
        })
    });

    it('submits the request to LLM when submit clicked (TC-002)', () => {
        fireEvent.change(input, {target: {value: "Test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(fetch).toHaveBeenCalledWith("api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: "Test",
                auth_token: 'test',
            })            
        })    
    });
    
    it('renders Generation in process text while awaiting content generation (TC-003)', () => {
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        expect(button.textContent).toBe("Generation in process");
    });
    
    // it('renders original prompt and list of songs when response received from LLM (TC-004)', () => {
    //     const alert = screen.queryByTestId('alert');
    //     expect(alert).toBeNull();

    //     fireEvent.change(input, 'Test');
    //     fireEvent.click(button);
        
    //     setTimeout(() => {
    //         expect(alert).not.toBeNull();
    //     }, 6000);
    // });

    // it('renders link to playlist once received input from LLM (TC-005)', () => {
    //     const link = screen.queryByTestId('alert');
    //     expect(link).toBeNull();

    //     fireEvent.change(input, 'Test');
    //     fireEvent.click(button);
        
    //     setTimeout(() => {
    //         expect(link).not.toBeNull();
    //     }, 6000);
    // });

    // it('renders save button after successful generation (TC-006)', () => {
    //     const saveButton = screen.queryByTestId('saveButton') as HTMLElement;
    //     expect(saveButton).toBeNull();
    //     fireEvent.change(input, {target: {value: "test"}});
    //     fireEvent.click(button);

    //     setTimeout(() => {
    //         expect(saveButton).not.toBeNull();
    //     }, 6000);
    // });

    // it('displays playlist created alert (TC-007)', () => {
    //     const alert = screen.queryByTestId('alert');
    //     expect(alert).toBeNull();
    //     fireEvent.change(input, 'Test');
    //     fireEvent.click(button);
        
    //     setTimeout(() => {
    //         const alert2 = screen.getByTestId('alert');
    //         expect(alert2).not.toBeNull();
    //     }, 6000);

    // });
    
    // it('renders generic error banner (TC-008)', () => {
    //     jest.mock("../LLM/LLM", () => {
    //         throw new Error();
    //     });

    //     const alert = screen.queryByTestId('genericErrorAlert');
    //     expect(alert).toBeNull();
    //     fireEvent.change(input, {target: {value: "test"}});
    //     fireEvent.click(button);

    //     setTimeout(() => {
    //         expect(alert).not.toBeNull();
    //     }, 6000);
    // });
    
    // it('renders response not received error banner (TC-009)', () => {
    //     jest.mock("../LLM/LLM", () => {
    //         throw new Error("500");
    //     });

    //     const alert = screen.queryByTestId('responseNotReceivedAlert');
    //     fireEvent.change(input, {target: {value: "test"}});
    //     fireEvent.click(button);

    //     setTimeout(() => {
    //         expect(alert).not.toBeNull();
    //     }, 6000);
    // });

    // it('adjusts to viewport (TC-010)', () => {
    //     window.innerHeight = 480;
    //     window.innerWidth = 480;
    //     fireEvent.resize(window);

    //     const form = screen.getByTestId('form');
    //     expect(form).toHaveStyle('height: 1000px');

    //     const title = screen.getByText(/Mixify/i);
    //     expect(title).toHaveStyle('font-size: 100px');
    // });

    // it('has alt text for screen readers (TC-011)', () => {
    //     const image = screen.getByAltText("image of some sound waves");
    //     expect(image).toBeInTheDocument();
    // });

    // it('renders invalid input alert (TC-012)', () => {
    //     const alert = screen.queryByTestId('invalidInputAlert');
    //     expect(alert).toBeNull();
    //     fireEvent.change(input, {target: {value: ""}});
    //     fireEvent.click(button);

    //     setTimeout(() => {
    //         expect(alert).not.toBeNull();
    //     }, 6000);
    // });  

    // it('adjusts length based on slider (TC-013)', () => {
    //     fireEvent.change(input, {target: {value: "test"}});
    //     fireEvent.change(slider, {target: {value: 10}});
    //     fireEvent.click(button);

    //     expect(LLM).toBeCalledWith("test", 10);    
    // });
});

// describe('homepage', () => {
    
    // afterEach(() => {
    //     jest.clearAllMocks();
    // });

    // it('understands basic prompts (TC-016)', async () => {
    //     (fetch as jest.Mock).mockResolvedValue({content: 'Test pass'});

    //     render(<Chat />);
    //     const input = screen.getByTestId('textInput');
    //     const slider = screen.getByTestId('sliderInput');
    //     const button = screen.getByTestId('submitButton');

    //     fireEvent.change(input, {target: {value: "test"}});
    //     fireEvent.change(slider, {target: {value: 10}});
    //     fireEvent.click(button);

    //     await waitFor(() => { expect(fetch).toHaveBeenCalled()});
    // });
// });