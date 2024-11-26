// import { render, screen } from '@testing-library/react';
// import { fireEvent } from '@testing-library/react';
// import { headers } from 'next/headers';
// import { createClient } from "@/utils/supabase/server";
// import ConnectSpotify from "@/components/connect-spotify";
// import DisconnectSpotify from "@/components/disconnect-spotify";
// import Profile from './page';
// import React from 'react';
// import '@testing-library/jest-dom';

// let connect: HTMLInputElement;
// let disconnect: HTMLInputElement;

// jest.mock('../../../utils/supabase/server.ts', () => {
//     return {
//         createClient: jest.fn().mockReturnValue({
//             auth: {
//                 getUser: jest.fn().mockReturnValue({data: { user: { name: 'test'}}})
//             }
//         })
//     };
// });

// jest.mock("next/headers", () => ({
//     headers: jest.fn(),
// }));

// describe('edit profile page', () => {
//     beforeEach(() => {
//         render(<Profile />);
//         connect = screen.getByTestId('connect');
//         disconnect = screen.getByTestId('disconnect');
//     });

//     it('renders profile image (TC-050)', () => {
//         const image = screen.getByAltText(/Spotify Profile/i);
//         expect(image).toBeInTheDocument();
//     });

//     it('renders navigation links on profile page (TC-051)', () => {
//         const title = screen.getByText(/Sign up/i);
//         expect(title).toBeInTheDocument();
//     });

//     it('calls connect to Spotify correctly (TC-052)', () => {
//         expect(window.location.href).not.toBe('/api/spotify/auth');
//         fireEvent.click(connect);
//         expect(ConnectSpotify).toHaveBeenCalled;
//         expect(window.location.href).toBe('/api/spotify/auth');
//     });

//     it('calls disconnect to Spotify correctly (TC-053)', () => {
//         fireEvent.click(disconnect);
//         expect(DisconnectSpotify).toHaveBeenCalled;
//     });
// });