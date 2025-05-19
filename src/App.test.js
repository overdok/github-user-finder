// src/App.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://test.com/avatar.jpg',
        bio: 'Test bio',
        followers: 100,
        following: 50,
        public_repos: 30,
        repos_url: 'https://api.github.com/users/testuser/repos'
      }),
    })
  );
});

afterEach(() => {
  fetch.mockClear();
});

describe('GitHub User Finder App', () => {
  test('renders the search form', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Enter GitHub username')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  test('shows loading state when searching', async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Enter GitHub username'), {
      target: { value: 'testuser' }
    });
    fireEvent.click(screen.getByText('Search'));
    
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  test('displays user data after successful search', async () => {
    // First mock - user data response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          login: 'testuser',
          name: 'Test User',
          avatar_url: 'https://test.com/avatar.jpg',
          bio: 'Test bio',
          followers: 100,
          following: 50,
          public_repos: 30,
          repos_url: 'https://api.github.com/users/testuser/repos'
        }),
      })
    );
  
    // Second mock - repositories response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([  // Note the array here
          {
            id: 1,
            name: 'repo1',
            html_url: 'https://github.com/testuser/repo1',
            description: 'First test repo',
            stargazers_count: 10,
            forks_count: 5
          }
        ]),
      })
    );
  
    render(<App />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter GitHub username'), {
      target: { value: 'testuser' }
    });
    fireEvent.click(screen.getByText('Search'));
  
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('repo1')).toBeInTheDocument();
    });
  });
  
  test('handles API errors gracefully', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not Found' }),
      })
    );

    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Enter GitHub username'), {
      target: { value: 'nonexistentuser' }
    });
    fireEvent.click(screen.getByText('Search'));

    expect(await screen.findByText('Error: User not found')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  test('does not search with empty username', () => {
    render(<App />);
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    expect(fetch).not.toHaveBeenCalled();
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});