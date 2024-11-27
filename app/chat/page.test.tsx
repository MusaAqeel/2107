import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from './page';
import React from 'react';
import { LucideAlignHorizontalDistributeCenter } from 'lucide-react';

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

let accesstoken = 'test' as any;
jest.mock('../hooks/connectionStatus', () => {
    return {
        SpotifyConnectionStatus: jest.fn().mockImplementation(() => ({
            spotifyConnection: {
                access_token: accesstoken,
                profile_data: {
                    display_name: 'Test Name',
                    images: ['testURL']
                }
            },
            connectionError: (null)
        }))
    };
});

jest.mock("next/headers", () => ({
    headers: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('TEST'),
    }),
}));

describe('homepage', () => {
    
    beforeEach(() => {
        render(<Chat />);
        input = screen.getByTestId('textInput');
        slider = screen.getByTestId('sliderInput');
        button = screen.getByTestId('submitButton');

        const mockFetch = jest.fn();

        mockFetch.mockReturnValueOnce( 
            {json: jest.fn().mockReturnValue({
                recommendations: {
                    recommendations: [
                        { title: 'Test 1', artist: 'Test Artist 1'},
                        { title: 'Test 2', artist: 'Test Artist 2'},
                        { title: 'Test 1', artist: 'Test Artist 3'},
                    ]
                }
            })}
        ).mockReturnValueOnce(
            {json: jest.fn().mockReturnValue('testURL')}
    );

    global.fetch = mockFetch;
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    it ('renders title (TC-001)', () => {
        const title = screen.getByText(/Mixify/i);
        expect(title).toBeInTheDocument();
    });

    it('submits the request to LLM when submit clicked (TC-002)', () => {
        fireEvent.change(input, {target: {value: "Test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(fetch).toHaveBeenCalledWith("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: "Test",
                auth_token: "test",
                playlist_length: 10,
            })
        })        
    });
    
    it('renders Generation in process text while awaiting content generation (TC-003)', () => {
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        expect(button.textContent).toBe("Generation in process");
    });
    
    it('renders original prompt and list of songs when response received from LLM (TC-004)', async () => {
        let alert = screen.queryByTestId('alert');
        expect(alert).toBeNull();

        fireEvent.change(input, {target: {value: "Test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        await waitFor(() => {
            alert = screen.getByTestId('alert');
            expect(alert).toBeTruthy();
        });
    });

    it('renders link to playlist once received input from LLM (TC-005)', async () => {
        const saveLink = screen.queryByTestId('linkAsaveLinklert');
        let playlistLink = screen.queryByTestId('saveLink');
        expect(saveLink).toBeNull();
        expect(playlistLink).toBeNull();

        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);
        
        await waitFor(() => {
            const saveButton = screen.getByTestId('saveButton') as HTMLElement;
            fireEvent.click(saveButton);
        });

        await waitFor(() => {
            playlistLink = screen.getByTestId('saveLink');
            expect(playlistLink).toBeTruthy();
        });
    });

    it('renders save button after successful generation (TC-006)', async () => {
        let saveButton = screen.queryByTestId('saveButton') as HTMLElement;
        expect(saveButton).toBeNull();

        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);
        
        await waitFor(() => {
            saveButton = screen.getByTestId('saveButton') as HTMLElement;
            fireEvent.click(saveButton);
        });
    });

    it('displays playlist created alert (TC-007)', async () => {
        let alert = screen.queryByTestId('alert');
        expect(alert).toBeNull();

        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);
        
        await waitFor(() => {
            const saveButton = screen.getByTestId('saveButton') as HTMLElement;
            fireEvent.click(saveButton);
        });

        await waitFor(() => {
            alert = screen.getByTestId('alert');
            expect(alert).toBeTruthy();
        });
    });

    it('limits the characters in the text box (TC-010)', () => {
        const overLimitInput = "AAAAAAAAAAAAAAAAAAAAAAAAAXXX";
        const maxInput = "AAAAAAAAAAAAAAAAAAAAAAAAA";
        fireEvent.change(input, {target: {value: overLimitInput}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(fetch).toHaveBeenCalledWith("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: maxInput,
                auth_token: "test",
                playlist_length: 10,
            })
        });
    });

    it('has alt text for screen readers (TC-011)', () => {
        const image = screen.getByAltText("Mixify logo");
        expect(image).toBeInTheDocument();
    });

    it('renders invalid input alert (TC-012)', async () => {
        let alert = screen.queryByTestId('invalidInputAlert');
        expect(alert).toBeNull();
        fireEvent.change(input, {target: {value: "   "}});
        fireEvent.click(button);

        await waitFor(() => {
            alert = screen.getByTestId('invalidInputAlert');
            expect(alert).toBeTruthy();
        });
    });  

    it('adjusts length based on slider (TC-013)', () => {
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.change(slider, {target: {value: 10}});
        fireEvent.click(button);

        expect(fetch).toHaveBeenCalledWith("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: "test",
                auth_token: "test",
                playlist_length: 10,
            })
        })    
    });
});


describe('API errors', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('renders error for missing access token (TC-008)', async () => {
        accesstoken = null;
        render(<Chat />);

        await waitFor(() => {
            const error = screen.getByTestId('error');
            expect(error).toBeTruthy();
        });
    });

    it('renders error for connection issues with Supabase (TC-009)', async () => {
        jest.clearAllMocks()
        render(<Chat />);

        await waitFor(() => {
            const error = screen.getByTestId('error');
            expect(error).toBeTruthy();
        });
    });
});